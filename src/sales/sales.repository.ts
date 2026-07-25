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
}
