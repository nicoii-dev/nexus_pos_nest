import { Injectable } from '@nestjs/common';

import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private computeStatus(currentStock: number, minimumStock: number): string {
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= minimumStock) return 'low_stock';
    return 'in_stock';
  }

  async findAll() {
    return this.productsRepository.findAll();
  }

  async findOne(id: string) {
    return this.productsRepository.findOne(id);
  }

  async create(dto: CreateProductDto) {
    const status = this.computeStatus(dto.currentStock, dto.minimumStock);
    return this.productsRepository.create(dto, status);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.productsRepository.findOne(id);

    const currentStock = dto.currentStock ?? existing.currentStock;
    const minimumStock = dto.minimumStock ?? existing.minimumStock;
    const status = this.computeStatus(currentStock, minimumStock);

    return this.productsRepository.update(id, dto, status);
  }

  async remove(id: string) {
    return this.productsRepository.remove(id);
  }
}
