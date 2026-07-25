import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'My Store', description: 'Business name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Business logo URL',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'PHP', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'Asia/Manila',
    description: 'Timezone',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 12, description: 'Tax rate percentage' })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({
    example: 'Thank you for shopping with us!',
    description: 'Receipt header text',
  })
  @IsOptional()
  @IsString()
  receiptHeader?: string;

  @ApiPropertyOptional({
    example: 'Visit us again!',
    description: 'Receipt footer text',
  })
  @IsOptional()
  @IsString()
  receiptFooter?: string;
}
