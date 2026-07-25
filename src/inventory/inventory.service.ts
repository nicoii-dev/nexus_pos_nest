import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  private readonly inventoryServiceLogger = new Logger(
    `📦 ${InventoryService.name}`
  );

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async createMovement(dto: CreateInventoryMovementDto) {
    const dbPayload = {
      product_id: dto.productId,
      product_name: dto.productName,
      type: dto.type,
      quantity: dto.quantity,
      date: dto.date,
      notes: dto.notes,
      performed_by: dto.performedBy,
    };

    const { data: movement, error: movementError } =
      await this.inventoryRepository.createMovement(dbPayload);

    if (movementError) {
      this.inventoryServiceLogger.error(
        'Error creating inventory movement:',
        movementError
      );
      throw new HttpException(
        movementError.message,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.adjustProductStock(dto.productId, dto.type, dto.quantity);

    return this.mapToCamelCase(movement);
  }

  async findAllMovements() {
    const { data, error } = await this.inventoryRepository.findAllMovements();

    if (error) {
      this.inventoryServiceLogger.error(
        'Error fetching inventory movements:',
        error
      );
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    return (data || []).map((row) => this.mapToCamelCase(row));
  }

  private async adjustProductStock(
    productId: string,
    type: string,
    quantity: number
  ) {
    const { data: product, error: productError } =
      await this.inventoryRepository.getProductStock(productId);

    if (productError || !product) {
      this.inventoryServiceLogger.error(
        'Error fetching product stock:',
        productError
      );
      return;
    }

    let newStock = product.current_stock;

    switch (type) {
      case 'stock_in':
        newStock += quantity;
        break;
      case 'stock_out':
        newStock -= quantity;
        break;
      case 'adjustment':
        newStock = quantity;
        break;
    }

    const { error: updateError } =
      await this.inventoryRepository.updateProductStock(productId, newStock);

    if (updateError) {
      this.inventoryServiceLogger.error(
        'Error updating product stock:',
        updateError
      );
    }
  }

  private mapToCamelCase(row: Record<string, unknown>) {
    return {
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      type: row.type,
      quantity: row.quantity,
      date: row.date,
      notes: row.notes,
      performedBy: row.performed_by,
      createdAt: row.created_at,
    };
  }
}
