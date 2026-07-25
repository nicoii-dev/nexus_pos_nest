import { Injectable, NotFoundException } from '@nestjs/common';

import { SalesRepository } from './sales.repository';

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

        return {
          id: sale.id,
          transactionNumber: sale.transaction_number,
          cashier: sale.cashier,
          items,
          subtotal: sale.subtotal,
          discount: sale.discount,
          total: sale.total,
          paymentMethod: sale.payment_method,
          status: sale.status,
          date: sale.date,
        };
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

    return {
      id: sale.id,
      transactionNumber: sale.transaction_number,
      cashier: sale.cashier,
      items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.payment_method,
      status: sale.status,
      date: sale.date,
    };
  }
}
