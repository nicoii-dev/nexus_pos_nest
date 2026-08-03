import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CheckoutDto } from './dto/checkout.dto';
import { SalesRepository } from './sales.repository';

interface SaleItemRow {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost: number;
  item_total: number;
  created_at: string;
}

interface ProductForCheckout {
  id: string;
  name: string;
  buying_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
}

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async findAll() {
    const { data: sales, error: salesError } =
      await this.salesRepository.findAll();

    if (salesError) {
      throw salesError;
    }

    const salesWithItems = await Promise.all(
      sales.map(async (sale) => {
        const { data: items, error: itemsError } =
          await this.salesRepository.findItemsBySaleId(sale.id);

        if (itemsError) {
          throw itemsError;
        }

        return this.buildSaleResponse(sale, items);
      }),
    );

    return salesWithItems;
  }

  async findOne(id: string) {
    const { data: sale, error: saleError } =
      await this.salesRepository.findOne(id);

    if (saleError || !sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const { data: items, error: itemsError } =
      await this.salesRepository.findItemsBySaleId(id);

    if (itemsError) {
      throw itemsError;
    }

    return this.buildSaleResponse(sale, items);
  }

  async checkout(dto: CheckoutDto, user?: { email?: string }) {
    const lines: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      cost: number;
      itemTotal: number;
    }> = [];
    const stockUpdates: Array<{
      productId: string;
      currentStock: number;
      minimumStock: number;
      quantity: number;
    }> = [];

    for (const item of dto.items) {
      const { data: product, error: productError } =
        await this.salesRepository.findProductForCheckout(item.productId);

      if (productError || !product) {
        throw new NotFoundException(
          `Product with ID "${item.productId}" not found`,
        );
      }

      if (Number(product.current_stock) < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}" (available: ${product.current_stock})`,
        );
      }

      const itemTotal = Number(product.selling_price) * item.quantity;

      lines.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: Number(product.selling_price),
        cost: Number(product.buying_price),
        itemTotal,
      });

      stockUpdates.push({
        productId: product.id,
        currentStock: Number(product.current_stock),
        minimumStock: Number(product.minimum_stock),
        quantity: item.quantity,
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.itemTotal, 0);
    const totalCost = lines.reduce(
      (sum, line) => sum + line.cost * line.quantity,
      0
    );
    const discount = dto.discount ?? 0;
    const total = subtotal - discount;
    const transactionNumber = await this.generateTransactionNumber();
    const cashier = dto.cashier ?? user?.email ?? 'Cashier';

    const { data: sale, error: saleError } =
      await this.salesRepository.createSale({
        transaction_number: transactionNumber,
        cashier,
        subtotal,
        discount,
        total_cost: totalCost,
        total,
        payment_method: dto.paymentMethod,
        status: 'completed',
      });

    if (saleError || !sale) {
      throw saleError;
    }

    const saleItems = lines.map((line) => ({
      sale_id: sale.id,
      product_id: line.productId,
      product_name: line.productName,
      quantity: line.quantity,
      price: line.price,
      cost: line.cost,
      item_total: line.itemTotal,
    }));

    const { error: itemsError } =
      await this.salesRepository.insertSaleItems(saleItems);

    if (itemsError) {
      throw itemsError;
    }

    await Promise.all(
      stockUpdates.map((stock) => this.applyStockDeduction(stock)),
    );

    const movements = lines.map((line) => ({
      product_id: line.productId,
      product_name: line.productName,
      type: 'stock_out',
      quantity: line.quantity,
      notes: `Sale ${transactionNumber}`,
      performed_by: cashier,
    }));

    const { error: movementsError } =
      await this.salesRepository.insertInventoryMovements(movements);

    if (movementsError) {
      throw movementsError;
    }

    const { data: insertedItems, error: fetchItemsError } =
      await this.salesRepository.findItemsBySaleId(sale.id);

    if (fetchItemsError) {
      throw fetchItemsError;
    }

    return this.buildSaleResponse(sale, insertedItems);
  }

  async getReceipt(id: string) {
    const sale = await this.findOne(id);

    const { data: settings, error: settingsError } =
      await this.salesRepository.findSettings();

    if (settingsError) {
      throw settingsError;
    }

    return {
      ...sale,
      store: settings
        ? {
            businessName: settings.business_name,
            currency: settings.currency,
            taxRate: Number(settings.tax_rate),
            receiptHeader: settings.receipt_header,
            receiptFooter: settings.receipt_footer,
          }
        : null,
    };
  }

  private async generateTransactionNumber() {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    const { count, error } =
      await this.salesRepository.countSalesOnDate(startOfDay);

    if (error) {
      throw error;
    }

    const sequence = (count ?? 0) + 1;

    return `TXN-${ymd}-${String(sequence).padStart(3, '0')}`;
  }

  private async applyStockDeduction(stock: {
    productId: string;
    currentStock: number;
    minimumStock: number;
    quantity: number;
  }) {
    const newStock = stock.currentStock - stock.quantity;
    const status =
      newStock === 0
        ? 'out_of_stock'
        : newStock <= stock.minimumStock
          ? 'low_stock'
          : 'in_stock';

    const { error } = await this.salesRepository.updateProductStock(
      stock.productId,
      newStock,
      status
    );

    if (error) {
      throw error;
    }
  }

  private buildSaleResponse(sale: Record<string, any>, items: SaleItemRow[]) {
    const totalCost = Number(sale.total_cost) || 0;

    return {
      id: sale.id,
      transactionNumber: sale.transaction_number,
      cashier: sale.cashier,
      items: (items ?? []).map((item) => {
        const quantity = Number(item.quantity);
        const price = Number(item.price);
        const cost = Number(item.cost) || 0;
        const itemTotal = Number(item.item_total);

        return {
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          quantity,
          price,
          cost,
          itemTotal,
          profit: itemTotal - cost * quantity,
          createdAt: item.created_at,
        };
      }),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      totalCost,
      total: Number(sale.total),
      profit: Number(sale.total) - totalCost,
      paymentMethod: sale.payment_method,
      status: sale.status,
      date: sale.date,
    };
  }
}
