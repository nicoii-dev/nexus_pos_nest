import { Injectable } from '@nestjs/common';

import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async findAll() {
    return this.customersRepository.findAll();
  }

  async findOne(id: string) {
    return this.customersRepository.findOne(id);
  }

  async create(dto: CreateCustomerDto) {
    return this.customersRepository.create(dto);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    return this.customersRepository.update(id, dto);
  }

  async remove(id: string) {
    return this.customersRepository.remove(id);
  }
}
