import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

@Injectable()
export class ReportsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getSalesByDateRange(startDate: string, endDate: string) {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
  }

  async getAllSales() {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .select('*')
      .order('date', { ascending: true });
  }

  async getSaleItemsByDateRange(startDate: string, endDate: string) {
    return await this.supabaseService
      .getClient()
      .from('sale_items')
      .select('*, sales!inner(date)')
      .gte('sales.date', startDate)
      .lte('sales.date', endDate);
  }

  async getSaleItemsWithCategories(startDate: string, endDate: string) {
    return await this.supabaseService
      .getClient()
      .from('sale_items')
      .select('quantity, price, product_id, product_name')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
  }

  async getAllProducts() {
    return await this.supabaseService
      .getClient()
      .from('products')
      .select('id, name, current_stock, minimum_stock');
  }

  async getLowStockProducts() {
    return await this.supabaseService
      .getClient()
      .from('products')
      .select('id, name, current_stock')
      .gt('current_stock', 0)
      .lte('current_stock', 10);
  }

  async getOutOfStockProducts() {
    return await this.supabaseService
      .getClient()
      .from('products')
      .select('id, name, current_stock')
      .lte('current_stock', 0);
  }
}
