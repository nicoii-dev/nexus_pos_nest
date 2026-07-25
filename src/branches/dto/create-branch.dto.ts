import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Branch', description: 'Name of the branch' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '123 Main St, City',
    description: 'Address of the branch',
  })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'John Doe', description: 'Manager of the branch' })
  @IsNotEmpty({ message: 'Manager is required' })
  @IsString()
  manager: string;

  @ApiProperty({
    example: '+639123456789',
    description: 'Contact number of the branch',
  })
  @IsNotEmpty({ message: 'Contact number is required' })
  @IsString()
  contactNumber: string;

  @ApiProperty({
    example: 'active',
    description: 'Status of the branch',
    enum: ['active', 'inactive'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['active', 'inactive'], {
    message: 'Status must be either active or inactive',
  })
  status: 'active' | 'inactive';
}
