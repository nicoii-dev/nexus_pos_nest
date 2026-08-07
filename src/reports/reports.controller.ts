import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'reports',
  version: '1',
})
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/dashboard-stats')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('/sales-trend')
  async getSalesTrend(@Query('period') period?: string) {
    return this.reportsService.getSalesTrend(period);
  }

  @Get('/revenue-trend')
  async getRevenueTrend(@Query('period') period?: string) {
    return this.reportsService.getRevenueTrend(period);
  }

  @Get('/monthly-income')
  async getMonthlyIncome() {
    return this.reportsService.getMonthlyIncome();
  }

  @Get('/top-selling-products')
  async getTopSellingProducts(@Query('limit') limit?: string) {
    return this.reportsService.getTopSellingProducts(limit ? parseInt(limit, 10) : 10);
  }

  @Get('/best-categories')
  async getBestCategories() {
    return this.reportsService.getBestCategories();
  }

  @Get('/summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSummary(startDate, endDate);
  }

  @Get('/monthly-revenue')
  async getMonthlyRevenue() {
    return this.reportsService.getMonthlyRevenue();
  }

  @Get('/payment-method-distribution')
  async getPaymentMethodDistribution() {
    return this.reportsService.getPaymentMethodDistribution();
  }

  @Get('/payment-methods')
  async getPaymentMethods(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPaymentMethods(startDate, endDate);
  }
}
