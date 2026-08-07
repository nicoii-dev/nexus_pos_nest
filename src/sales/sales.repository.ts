import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

@Injectable()
export class SalesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async findOne(id: string) {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
  }

  async findItemsBySaleId(saleId: string) {
    return await this.supabaseService
      .getClient()
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);
  }

  async findTransfersBySaleId(saleId: string) {
    return await this.supabaseService
      .getClient()
      .from('payment_transfers')
      .select('*')
      .eq('sale_id', saleId)
      .order('created_at', { ascending: false });
  }

  async findAllTransfers() {
    return await this.supabaseService
      .getClient()
      .from('payment_transfers')
      .select('*');
  }

  async findProductForCheckout(productId: string) {
    return await this.supabaseService
      .getClient()
      .from('products')
      .select('id, name, buying_price, selling_price, current_stock, minimum_stock')
      .eq('id', productId)
      .single();
  }

  async countSalesOnDate(startOfDay: string) {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .gte('date', startOfDay);
  }

  async createSale(payload: Record<string, unknown>) {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .insert(payload)
      .select()
      .single();
  }

  async insertSaleItems(items: Array<Record<string, unknown>>) {
    return await this.supabaseService
      .getClient()
      .from('sale_items')
      .insert(items)
      .select();
  }

  async updateProductStock(
    productId: string,
    currentStock: number,
    status: string
  ) {
    return await this.supabaseService
      .getClient()
      .from('products')
      .update({ current_stock: currentStock, status })
      .eq('id', productId)
      .select()
      .single();
  }

  async insertInventoryMovements(movements: Array<Record<string, unknown>>) {
    return await this.supabaseService
      .getClient()
      .from('inventory_movements')
      .insert(movements)
      .select();
  }

  async findSettings() {
    return await this.supabaseService
      .getClient()
      .from('settings')
      .select('*')
      .limit(1)
      .single();
  }
}
