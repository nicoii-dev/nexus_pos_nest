import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

import { SalesService } from './sales.service';

@ApiTags('Sales')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'sales',
  version: '1',
})
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Public()
  @Get('/')
  async findAll() {
    return this.salesService.findAll();
  }

  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
