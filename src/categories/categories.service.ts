import { Injectable } from '@nestjs/common';

import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string) {
    return this.categoriesRepository.findOne(id);
  }
}
