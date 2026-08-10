import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

interface CustomerRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapToCamelCase(row: CustomerRow): CustomerResponse {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      phone: row.phone,
      address: row.address,
      remarks: row.remarks,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as CustomerRow[]).map((row) => this.mapToCamelCase(row));
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return this.mapToCamelCase(data as CustomerRow);
  }

  async create(dto: CreateCustomerDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('customers')
      .insert({
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone ?? null,
        address: dto.address ?? null,
        remarks: dto.remarks ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToCamelCase(data as CustomerRow);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const updatePayload: Record<string, unknown> = {};

    if (dto.firstName !== undefined) updatePayload.first_name = dto.firstName;
    if (dto.lastName !== undefined) updatePayload.last_name = dto.lastName;
    if (dto.phone !== undefined) updatePayload.phone = dto.phone;
    if (dto.address !== undefined) updatePayload.address = dto.address;
    if (dto.remarks !== undefined) updatePayload.remarks = dto.remarks;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('customers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return this.mapToCamelCase(data as CustomerRow);
  }

  async remove(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('customers')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return { message: 'Customer deleted successfully' };
  }
}
