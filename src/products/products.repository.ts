import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string;
  category_id: string;
  buying_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  status: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  categories?: { id: string; name: string } | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string;
  categoryId: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  unit: string;
  status: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapToCamelCase(row: ProductRow): ProductResponse {
    const { categories, category_id, buying_price, selling_price, current_stock, minimum_stock, created_at, updated_at, ...rest } = row;
    return {
      ...rest,
      categoryId: category_id,
      buyingPrice: Number(buying_price),
      sellingPrice: Number(selling_price),
      currentStock: current_stock,
      minimumStock: minimum_stock,
      createdAt: created_at,
      updatedAt: updated_at,
      category: categories ?? undefined,
    };
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*, categories(id, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as ProductRow[]).map((row) => this.mapToCamelCase(row));
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.mapToCamelCase(data as ProductRow);
  }

  async create(dto: CreateProductDto, status: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .insert({
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        description: dto.description,
        category_id: dto.categoryId,
        buying_price: dto.buyingPrice,
        selling_price: dto.sellingPrice,
        current_stock: dto.currentStock,
        minimum_stock: dto.minimumStock,
        unit: dto.unit,
        status,
        image: dto.image ?? null,
      })
      .select('*, categories(id, name)')
      .single();

    if (error) throw error;

    return this.mapToCamelCase(data as ProductRow);
  }

  async update(id: string, dto: UpdateProductDto, status: string) {
    const updatePayload: Record<string, unknown> = { status };

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.sku !== undefined) updatePayload.sku = dto.sku;
    if (dto.barcode !== undefined) updatePayload.barcode = dto.barcode;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.categoryId !== undefined) updatePayload.category_id = dto.categoryId;
    if (dto.buyingPrice !== undefined) updatePayload.buying_price = dto.buyingPrice;
    if (dto.sellingPrice !== undefined) updatePayload.selling_price = dto.sellingPrice;
    if (dto.currentStock !== undefined) updatePayload.current_stock = dto.currentStock;
    if (dto.minimumStock !== undefined) updatePayload.minimum_stock = dto.minimumStock;
    if (dto.unit !== undefined) updatePayload.unit = dto.unit;
    if (dto.image !== undefined) updatePayload.image = dto.image;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*, categories(id, name)')
      .single();

    if (error || !data) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.mapToCamelCase(data as ProductRow);
  }

  async remove(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return { message: 'Product deleted successfully' };
  }
}
