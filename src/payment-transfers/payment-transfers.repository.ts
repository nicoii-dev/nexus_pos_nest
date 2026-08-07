import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

@Injectable()
export class PaymentTransfersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    return await this.supabaseService
      .getClient()
      .from('payment_transfers')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async findBySaleId(saleId: string) {
    return await this.supabaseService
      .getClient()
      .from('payment_transfers')
      .select('*')
      .eq('sale_id', saleId)
      .order('created_at', { ascending: false });
  }

  async findSale(saleId: string) {
    return await this.supabaseService
      .getClient()
      .from('sales')
      .select('id, transaction_number, payment_method, total')
      .eq('id', saleId)
      .single();
  }

  async createTransfer(payload: Record<string, unknown>) {
    return await this.supabaseService
      .getClient()
      .from('payment_transfers')
      .insert(payload)
      .select()
      .single();
  }
}
