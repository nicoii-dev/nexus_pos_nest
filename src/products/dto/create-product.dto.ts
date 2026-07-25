import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'Product name' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'WM-001', description: 'Stock Keeping Unit' })
  @IsNotEmpty({ message: 'SKU is required' })
  @IsString()
  sku: string;

  @ApiProperty({ example: '1234567890123', description: 'Barcode' })
  @IsNotEmpty({ message: 'Barcode is required' })
  @IsString()
  barcode: string;

  @ApiProperty({
    example: 'Ergonomic wireless mouse',
    description: 'Product description',
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Category ID',
  })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 15.99, description: 'Buying price' })
  @IsNotEmpty({ message: 'Buying price is required' })
  @IsNumber({}, { message: 'Buying price must be a number' })
  @Min(0, { message: 'Buying price must be at least 0' })
  buyingPrice: number;

  @ApiProperty({ example: 29.99, description: 'Selling price' })
  @IsNotEmpty({ message: 'Selling price is required' })
  @IsNumber({}, { message: 'Selling price must be a number' })
  @Min(0, { message: 'Selling price must be at least 0' })
  sellingPrice: number;

  @ApiProperty({ example: 100, description: 'Current stock quantity' })
  @IsNotEmpty({ message: 'Current stock is required' })
  @IsNumber({}, { message: 'Current stock must be a number' })
  @Min(0, { message: 'Current stock must be at least 0' })
  currentStock: number;

  @ApiProperty({ example: 10, description: 'Minimum stock threshold' })
  @IsNotEmpty({ message: 'Minimum stock is required' })
  @IsNumber({}, { message: 'Minimum stock must be a number' })
  @Min(0, { message: 'Minimum stock must be at least 0' })
  minimumStock: number;

  @ApiProperty({ example: 'piece', description: 'Unit of measurement' })
  @IsNotEmpty({ message: 'Unit is required' })
  @IsString()
  unit: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'Product image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}
