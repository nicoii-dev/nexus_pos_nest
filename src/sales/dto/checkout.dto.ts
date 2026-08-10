import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @ApiProperty({
    example: 'd1111111-1111-1111-1111-111111111111',
    description: 'Product ID',
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({
    type: [CheckoutItemDto],
    description: 'Items to be checked out',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ example: 50, description: 'Discount amount', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Discount must be a number' })
  @Min(0, { message: 'Discount cannot be negative' })
  discount?: number;

  @ApiProperty({
    example: 'cash',
    description: 'Payment method',
    enum: ['cash', 'card', 'digital', 'credit'],
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(['cash', 'card', 'digital', 'credit'], {
    message: 'Payment method must be cash, card, digital, or credit',
  })
  paymentMethod: 'cash' | 'card' | 'digital' | 'credit';

  @ApiProperty({
    example: 'ca111111-1111-1111-1111-111111111111',
    description: 'Customer ID (required for credit sales)',
    required: false,
  })
  @ValidateIf((dto: CheckoutDto) => dto.paymentMethod === 'credit')
  @IsNotEmpty({ message: 'Customer is required for credit sales' })
  @IsUUID(undefined, { message: 'Customer ID must be a valid UUID' })
  customerId?: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Cashier name (defaults to the authenticated user)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cashier?: string;
}
