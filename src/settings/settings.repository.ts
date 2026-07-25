import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findOne() {
    return await this.supabaseService
      .getClient()
      .from('settings')
      .select('*')
      .limit(1)
      .single();
  }

  async update(id: string, updateSettingsDto: UpdateSettingsDto) {
    const updateData: Record<string, unknown> = {};

    if (updateSettingsDto.businessName !== undefined)
      updateData.business_name = updateSettingsDto.businessName;
    if (updateSettingsDto.logo !== undefined)
      updateData.logo = updateSettingsDto.logo;
    if (updateSettingsDto.currency !== undefined)
      updateData.currency = updateSettingsDto.currency;
    if (updateSettingsDto.timezone !== undefined)
      updateData.timezone = updateSettingsDto.timezone;
    if (updateSettingsDto.taxRate !== undefined)
      updateData.tax_rate = updateSettingsDto.taxRate;
    if (updateSettingsDto.receiptHeader !== undefined)
      updateData.receipt_header = updateSettingsDto.receiptHeader;
    if (updateSettingsDto.receiptFooter !== undefined)
      updateData.receipt_footer = updateSettingsDto.receiptFooter;

    return await this.supabaseService
      .getClient()
      .from('settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
  }
}
