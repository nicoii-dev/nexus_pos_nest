import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentTransferDto {
  @ApiProperty({
    example: 'e1111111-1111-1111-1111-111111111111',
    description: 'Sale ID the payment is transferred from',
  })
  @IsNotEmpty({ message: 'Sale ID is required' })
  @IsUUID(undefined, { message: 'Sale ID must be a valid UUID' })
  saleId: string;

  @ApiProperty({
    required: false,
    description: 'Sale payment record ID being transferred',
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'Sale payment ID must be a valid UUID' })
  salePaymentId?: string;

  @ApiProperty({
    example: 'card',
    description: 'Source payment type',
    enum: ['cash', 'card', 'digital', 'credit'],
  })
  @IsNotEmpty({ message: 'From payment type is required' })
  @IsEnum(['cash', 'card', 'digital', 'credit'], {
    message: 'From payment type must be cash, card, digital, or credit',
  })
  fromPaymentType: 'cash' | 'card' | 'digital' | 'credit';

  @ApiProperty({
    example: 'cash',
    description: 'Destination payment type',
    enum: ['cash', 'card', 'digital', 'credit'],
  })
  @IsNotEmpty({ message: 'To payment type is required' })
  @IsEnum(['cash', 'card', 'digital', 'credit'], {
    message: 'To payment type must be cash, card, digital, or credit',
  })
  toPaymentType: 'cash' | 'card' | 'digital' | 'credit';

  @ApiProperty({ example: 5000, description: 'Amount transferred' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than zero' })
  amount: number;

  @ApiProperty({
    required: false,
    description: 'Reason for the transfer',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
