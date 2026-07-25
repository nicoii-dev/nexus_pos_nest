import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInventoryMovementDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Product UUID',
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Espresso Beans', description: 'Product name' })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  productName: string;

  @ApiProperty({
    example: 'stock_in',
    description: 'Movement type',
    enum: ['stock_in', 'stock_out', 'adjustment'],
  })
  @IsNotEmpty({ message: 'Movement type is required' })
  @IsEnum(['stock_in', 'stock_out', 'adjustment'], {
    message: 'Type must be stock_in, stock_out, or adjustment',
  })
  type: 'stock_in' | 'stock_out' | 'adjustment';

  @ApiProperty({ example: 50, description: 'Quantity moved' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  quantity: number;

  @ApiProperty({
    example: '2026-07-19T10:00:00Z',
    description: 'Date of movement',
  })
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;

  @ApiProperty({ example: 'Restocked from supplier', description: 'Notes' })
  @IsNotEmpty({ message: 'Notes are required' })
  @IsString()
  notes: string;

  @ApiProperty({ example: 'John Doe', description: 'Person who performed the movement' })
  @IsNotEmpty({ message: 'Performed by is required' })
  @IsString()
  performedBy: string;
}
