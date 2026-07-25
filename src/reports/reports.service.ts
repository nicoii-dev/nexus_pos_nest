import { Injectable } from '@nestjs/common';

import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const [todaySales, weeklySales, monthlySales, products, lowStock, outOfStock] =
      await Promise.all([
        this.reportsRepository.getSalesByDateRange(todayStart, todayEnd),
        this.reportsRepository.getSalesByDateRange(weekStartStr, todayEnd),
        this.reportsRepository.getSalesByDateRange(monthStart, monthEnd),
        this.reportsRepository.getAllProducts(),
        this.reportsRepository.getLowStockProducts(),
        this.reportsRepository.getOutOfStockProducts(),
      ]);

    const todaysSalesCount = todaySales.data?.length ?? 0;
    const todaysRevenue = todaySales.data?.reduce((sum, s) => sum + (Number(s.total) || 0), 0) ?? 0;
    const todaysProfit = todaySales.data?.reduce((sum, s) => {
      return sum + (Number(s.total) || 0) - (Number(s.discount) || 0);
    }, 0) ?? 0;

    return {
      todaysSales: todaysSalesCount,
      todaysRevenue,
      todaysProfit,
      todaysTransactions: todaysSalesCount,
      weeklySales: weeklySales.data?.length ?? 0,
      monthlySales: monthlySales.data?.length ?? 0,
      totalProducts: products.data?.length ?? 0,
      lowStockProducts: lowStock.data?.length ?? 0,
      outOfStockProducts: outOfStock.data?.length ?? 0,
    };
  }

  async getSalesTrend(period?: string) {
    const now = new Date();
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    const startDate = d.toISOString();
    const endDate = now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(startDate, endDate);
    const salesData = sales.data ?? [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped: Record<string, number> = {};

    for (const sale of salesData) {
      const date = new Date(sale.date);
      const key = dayNames[date.getDay()];
      grouped[key] = (grouped[key] || 0) + 1;
    }

    const result = dayNames.map((name) => ({
      name,
      value: grouped[name] || 0,
    }));

    return result;
  }

  async getRevenueTrend(period?: string) {
    const now = new Date();
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    const startDate = d.toISOString();
    const endDate = now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(startDate, endDate);
    const salesData = sales.data ?? [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped: Record<string, { revenue: number; prev: number }> = {};

    for (const sale of salesData) {
      const date = new Date(sale.date);
      const key = dayNames[date.getDay()];
      if (!grouped[key]) {
        grouped[key] = { revenue: 0, prev: 0 };
      }
      grouped[key].revenue += Number(sale.total) || 0;
      grouped[key].prev += (Number(sale.total) || 0) * 0.9;
    }

    return dayNames.map((name) => ({
      name,
      value: grouped[name]?.revenue || 0,
      value2: grouped[name]?.prev || 0,
    }));
  }

  async getMonthlyIncome() {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    const endDate = now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(startDate, endDate);
    const salesData = sales.data ?? [];

    const grouped: Record<string, number> = {};
    for (const sale of salesData) {
      const date = new Date(sale.date);
      const key = monthNames[date.getMonth()];
      grouped[key] = (grouped[key] || 0) + (Number(sale.total) || 0);
    }

    return monthNames.slice(0, now.getMonth() + 1).map((name) => ({
      name,
      value: grouped[name] || 0,
    }));
  }

  async getTopSellingProducts(limit: number = 5) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = now.toISOString();

    const items = await this.reportsRepository.getSaleItemsByDateRange(monthStart, endDate);
    const itemsData = items.data ?? [];

    const grouped: Record<string, { name: string; quantity: number }> = {};
    for (const item of itemsData) {
      const key = item.product_id ?? item.product_name;
      if (!grouped[key]) {
        grouped[key] = { name: item.product_name, quantity: 0 };
      }
      grouped[key].quantity += Number(item.quantity) || 0;
    }

    return Object.values(grouped)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map((item) => ({
        name: item.name,
        value: item.quantity,
      }));
  }

  async getBestCategories() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = now.toISOString();

    const items = await this.reportsRepository.getSaleItemsByDateRange(monthStart, endDate);
    const itemsData = items.data ?? [];

    const grouped: Record<string, number> = {};
    for (const item of itemsData) {
      const name = item.product_name || 'Uncategorized';
      grouped[name] = (grouped[name] || 0) + ((Number(item.quantity) || 0) * (Number(item.price) || 0));
    }

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }

  async getSummary(startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate ?? now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(start, end);
    const salesData = sales.data ?? [];

    const totalSales = salesData.length;
    const revenue = salesData.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const discount = salesData.reduce((sum, s) => sum + (Number(s.discount) || 0), 0);
    const profit = revenue - discount;
    const transactions = totalSales;
    const averageOrderValue = totalSales > 0 ? revenue / totalSales : 0;

    return {
      totalSales,
      revenue,
      income: revenue,
      profit,
      transactions,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  async getMonthlyRevenue() {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    const endDate = now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(startDate, endDate);
    const salesData = sales.data ?? [];

    const grouped: Record<string, { revenue: number; expenses: number }> = {};
    for (const sale of salesData) {
      const date = new Date(sale.date);
      const key = monthNames[date.getMonth()];
      if (!grouped[key]) {
        grouped[key] = { revenue: 0, expenses: 0 };
      }
      grouped[key].revenue += Number(sale.total) || 0;
      grouped[key].expenses += (Number(sale.total) || 0) * 0.85;
    }

    return monthNames.slice(0, now.getMonth() + 1).map((name) => ({
      name,
      value: grouped[name]?.revenue || 0,
      value2: grouped[name]?.expenses || 0,
    }));
  }

  async getPaymentMethodDistribution() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(monthStart, endDate);
    const salesData = sales.data ?? [];

    const grouped: Record<string, number> = {};
    for (const sale of salesData) {
      const method = sale.payment_method ?? 'Unknown';
      grouped[method] = (grouped[method] || 0) + 1;
    }

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }
}
