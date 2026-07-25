import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

@Injectable()
export class InventoryRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createMovement(data: Record<string, unknown>) {
    return await this.supabaseService
      .getClient()
      .from('inventory_movements')
      .insert(data)
      .select()
      .single();
  }

  async findAllMovements() {
    return await this.supabaseService
      .getClient()
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async findMovementsByProductId(productId: string) {
    return await this.supabaseService
      .getClient()
      .from('inventory_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
  }

  async updateProductStock(productId: string, currentStock: number) {
    return await this.supabaseService
      .getClient()
      .from('products')
      .update({ current_stock: currentStock })
      .eq('id', productId)
      .select()
      .single();
  }

  async getProductStock(productId: string) {
    return await this.supabaseService
      .getClient()
      .from('products')
      .select('current_stock')
      .eq('id', productId)
      .single();
  }
}
