import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CheckoutDto } from './dto/checkout.dto';
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

  @Get('/')
  async findAll() {
    return this.salesService.findAll();
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Checkout an order and create a sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid items or insufficient stock' })
  @ApiResponse({ status: 404, description: 'A product was not found' })
  async checkout(@Body() dto: CheckoutDto, @Req() req: Request) {
    const user = (req as Request & { user?: { email?: string } }).user;
    return this.salesService.checkout(dto, user);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get('/:id/receipt')
  @ApiOperation({ summary: 'Get a sale receipt with store details' })
  @ApiResponse({ status: 200, description: 'Receipt data' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async getReceipt(@Param('id') id: string) {
    return this.salesService.getReceipt(id);
  }
}
