import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SaleItemDto {
  @ApiProperty({ example: 'prod-001', description: 'Product ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Coffee', description: 'Product name' })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 150, description: 'Unit price' })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 300, description: 'Total for this item' })
  @IsNotEmpty({ message: 'Total is required' })
  @IsNumber()
  total: number;
}

export class CreateSaleDto {
  @ApiProperty({
    example: 'TXN-20260719-001',
    description: 'Transaction number',
  })
  @IsNotEmpty({ message: 'Transaction number is required' })
  @IsString()
  transactionNumber: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Cashier name' })
  @IsNotEmpty({ message: 'Cashier is required' })
  @IsString()
  cashier: string;

  @ApiProperty({
    type: [SaleItemDto],
    description: 'Sale items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({ example: 500, description: 'Subtotal amount' })
  @IsNotEmpty({ message: 'Subtotal is required' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ example: 50, description: 'Discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  discount: number;

  @ApiProperty({ example: 450, description: 'Total amount' })
  @IsNotEmpty({ message: 'Total is required' })
  @IsNumber()
  total: number;

  @ApiProperty({
    example: 'cash',
    description: 'Payment method',
    enum: ['cash', 'card', 'digital'],
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(['cash', 'card', 'digital'], {
    message: 'Payment method must be cash, card, or digital',
  })
  paymentMethod: 'cash' | 'card' | 'digital';

  @ApiProperty({
    example: 'completed',
    description: 'Sale status',
    enum: ['completed', 'pending', 'refunded'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['completed', 'pending', 'refunded'], {
    message: 'Status must be completed, pending, or refunded',
  })
  status: 'completed' | 'pending' | 'refunded';

  @ApiProperty({
    example: '2026-07-19T10:30:00.000Z',
    description: 'Sale date',
  })
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;
}
