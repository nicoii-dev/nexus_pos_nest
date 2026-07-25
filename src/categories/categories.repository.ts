import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    return await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async findOne(id: string) {
    return await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
  }
}
