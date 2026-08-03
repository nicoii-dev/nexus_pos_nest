import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'categories',
  version: '1',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/')
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}
