import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    return await this.supabaseService
      .getClient()
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async findOne(id: string) {
    return await this.supabaseService
      .getClient()
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();
  }

  async create(createBranchDto: CreateBranchDto) {
    return await this.supabaseService
      .getClient()
      .from('branches')
      .insert({
        name: createBranchDto.name,
        address: createBranchDto.address,
        manager: createBranchDto.manager,
        contact_number: createBranchDto.contactNumber,
        status: createBranchDto.status,
      })
      .select()
      .single();
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const updateData: Record<string, unknown> = {};

    if (updateBranchDto.name !== undefined)
      updateData.name = updateBranchDto.name;
    if (updateBranchDto.address !== undefined)
      updateData.address = updateBranchDto.address;
    if (updateBranchDto.manager !== undefined)
      updateData.manager = updateBranchDto.manager;
    if (updateBranchDto.contactNumber !== undefined)
      updateData.contact_number = updateBranchDto.contactNumber;
    if (updateBranchDto.status !== undefined)
      updateData.status = updateBranchDto.status;

    return await this.supabaseService
      .getClient()
      .from('branches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
  }

  async remove(id: string) {
    return await this.supabaseService
      .getClient()
      .from('branches')
      .delete()
      .eq('id', id)
      .select()
      .single();
  }
}
