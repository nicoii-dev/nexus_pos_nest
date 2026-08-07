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

import { CreatePaymentTransferDto } from './dto/create-payment-transfer.dto';
import { PaymentTransfersService } from './payment-transfers.service';

@ApiTags('Payment Transfers')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'payment-transfers',
  version: '1',
})
export class PaymentTransfersController {
  constructor(private readonly paymentTransfersService: PaymentTransfersService) {}

  @Get('/')
  @ApiOperation({ summary: 'List all payment transfers' })
  @ApiResponse({ status: 200, description: 'Payment transfers returned' })
  async findAll() {
    return this.paymentTransfersService.findAll();
  }

  @Get('/sale/:saleId')
  @ApiOperation({ summary: 'List payment transfers for a sale' })
  @ApiResponse({ status: 200, description: 'Payment transfers returned' })
  async findBySaleId(@Param('saleId') saleId: string) {
    return this.paymentTransfersService.findBySaleId(saleId);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record a payment transfer from one type to another',
  })
  @ApiResponse({ status: 201, description: 'Payment transferred successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async transfer(@Body() dto: CreatePaymentTransferDto, @Req() req: Request) {
    const user = (req as Request & { user?: { id?: string } }).user;
    return this.paymentTransfersService.transfer(dto, user);
  }
}
