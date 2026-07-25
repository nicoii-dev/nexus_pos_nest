import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SigninDto {
  @ApiProperty({ example: 'admin@nexuspos.com', description: 'Email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'User password',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

export class SignupDto {
  @ApiProperty({ example: 'John', description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@nexuspos.com', description: 'Email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({ example: 'admin', description: 'Role of the user', enum: ['admin', 'manager', 'cashier'] })
  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  role: string;
}
