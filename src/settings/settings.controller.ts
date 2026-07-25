import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'settings',
  version: '1',
})
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get store settings' })
  @ApiResponse({ status: 200, description: 'Store settings retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne() {
    return this.settingsService.findOne();
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update store settings' })
  @ApiResponse({ status: 200, description: 'Store settings updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.update(updateSettingsDto);
  }
}
