import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { SettingsRepository } from './settings.repository';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly settingsLogger = new Logger(`⚙️ ${SettingsService.name}`);

  constructor(private readonly settingsRepository: SettingsRepository) {}

  async findOne() {
    const { data, error } = await this.settingsRepository.findOne();

    if (error) {
      this.settingsLogger.error('Error fetching settings:', error);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.mapDbToResponse(data);
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const existing = await this.findOne();

    const { data, error } = await this.settingsRepository.update(
      existing.id,
      updateSettingsDto,
    );

    if (error) {
      this.settingsLogger.error('Error updating settings:', error);
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.mapDbToResponse(data);
  }

  private mapDbToResponse(dbRecord: any) {
    return {
      id: dbRecord.id,
      businessName: dbRecord.business_name,
      logo: dbRecord.logo,
      currency: dbRecord.currency,
      timezone: dbRecord.timezone,
      taxRate: dbRecord.tax_rate,
      receiptHeader: dbRecord.receipt_header,
      receiptFooter: dbRecord.receipt_footer,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
