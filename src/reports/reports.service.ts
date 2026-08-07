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

    const [todaySales, todayItems, weeklySales, monthlySales, products, lowStock, outOfStock] =
      await Promise.all([
        this.reportsRepository.getSalesByDateRange(todayStart, todayEnd),
        this.reportsRepository.getSaleItemsByDateRange(todayStart, todayEnd),
        this.reportsRepository.getSalesByDateRange(weekStartStr, todayEnd),
        this.reportsRepository.getSalesByDateRange(monthStart, monthEnd),
        this.reportsRepository.getAllProducts(),
        this.reportsRepository.getLowStockProducts(),
        this.reportsRepository.getOutOfStockProducts(),
      ]);

    const todaysSalesCount = todaySales.data?.length ?? 0;
    const todaysRevenue = todaySales.data?.reduce((sum, s) => sum + (Number(s.total) || 0), 0) ?? 0;
    const todaysExpense = todayItems.data?.reduce(
      (sum, item) => sum + (Number(item.cost) || 0) * (Number(item.quantity) || 0),
      0,
    ) ?? 0;
    const todaysProfit = todaysRevenue - todaysExpense;

    return {
      todaysSales: todaysSalesCount,
      todaysRevenue,
      todaysExpense,
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

    const items = await this.reportsRepository.getSaleItemsByDateRange(startDate, endDate);
    const itemsData = items.data ?? [];

    const grouped: Record<string, number> = {};
    for (const item of itemsData) {
      const quantity = Number(item.quantity) || 0;
      const date = new Date(item.sales?.date ?? item.created_at);
      const key = monthNames[date.getMonth()];
      const revenue = quantity * (Number(item.price) || 0);
      const cost = quantity * (Number(item.cost) || 0);
      grouped[key] = (grouped[key] || 0) + (revenue - cost);
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

    const grouped: Record<string, { name: string; quantity: number; revenue: number; cost: number }> = {};
    for (const item of itemsData) {
      const key = item.product_id ?? item.product_name;
      const quantity = Number(item.quantity) || 0;
      if (!grouped[key]) {
        grouped[key] = { name: item.product_name, quantity: 0, revenue: 0, cost: 0 };
      }
      grouped[key].quantity += quantity;
      grouped[key].revenue += quantity * (Number(item.price) || 0);
      grouped[key].cost += quantity * (Number(item.cost) || 0);
    }

    return Object.values(grouped)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map((item) => ({
        name: item.name,
        value: item.quantity,
        revenue: item.revenue,
        cost: item.cost,
        profit: item.revenue - item.cost,
      }));
  }

  async getBestCategories() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = now.toISOString();

    const items = await this.reportsRepository.getSaleItemsByDateRange(monthStart, endDate);
    const itemsData = items.data ?? [];

    const grouped: Record<string, { name: string; revenue: number; cost: number }> = {};
    for (const item of itemsData) {
      const name = item.product_name || 'Uncategorized';
      const quantity = Number(item.quantity) || 0;
      if (!grouped[name]) {
        grouped[name] = { name, revenue: 0, cost: 0 };
      }
      grouped[name].revenue += quantity * (Number(item.price) || 0);
      grouped[name].cost += quantity * (Number(item.cost) || 0);
    }

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([name, value]) => ({
        name,
        value: value.revenue,
        cost: value.cost,
        profit: value.revenue - value.cost,
      }));
  }

  async getSummary(startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate ?? now.toISOString();

    const [sales, items] = await Promise.all([
      this.reportsRepository.getSalesByDateRange(start, end),
      this.reportsRepository.getSaleItemsByDateRange(start, end),
    ]);
    const salesData = sales.data ?? [];
    const itemsData = items.data ?? [];

    const totalSales = salesData.length;
    const revenue = salesData.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const discount = salesData.reduce((sum, s) => sum + (Number(s.discount) || 0), 0);
    const expense = itemsData.reduce(
      (sum, item) => sum + (Number(item.cost) || 0) * (Number(item.quantity) || 0),
      0,
    );
    const profit = revenue - expense;
    const transactions = totalSales;
    const averageOrderValue = totalSales > 0 ? revenue / totalSales : 0;
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 10000) / 100 : 0;

    return {
      totalSales,
      revenue,
      income: revenue,
      expense,
      profit,
      profitMargin,
      transactions,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  async getMonthlyRevenue() {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    const endDate = now.toISOString();

    const items = await this.reportsRepository.getSaleItemsByDateRange(startDate, endDate);
    const itemsData = items.data ?? [];

    const grouped: Record<string, { revenue: number; expenses: number }> = {};
    for (const item of itemsData) {
      const quantity = Number(item.quantity) || 0;
      const date = new Date(item.sales?.date ?? item.created_at);
      const key = monthNames[date.getMonth()];
      if (!grouped[key]) {
        grouped[key] = { revenue: 0, expenses: 0 };
      }
      grouped[key].revenue += quantity * (Number(item.price) || 0);
      grouped[key].expenses += quantity * (Number(item.cost) || 0);
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

  async getPaymentMethods(startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate ?? now.toISOString();

    const sales = await this.reportsRepository.getSalesByDateRange(start, end);
    const salesData = sales.data ?? [];

    const grouped: Record<string, { count: number; revenue: number }> = {};
    for (const sale of salesData) {
      const method = sale.payment_method ?? 'Unknown';
      if (!grouped[method]) {
        grouped[method] = { count: 0, revenue: 0 };
      }
      grouped[method].count += 1;
      grouped[method].revenue += Number(sale.total) || 0;
    }

    const totalCount = Object.values(grouped).reduce((sum, g) => sum + g.count, 0);
    const totalRevenue = Object.values(grouped).reduce((sum, g) => sum + g.revenue, 0);

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([name, value]) => ({
        name,
        value: value.count,
        revenue: Math.round(value.revenue * 100) / 100,
        countPercentage: totalCount > 0 ? Math.round((value.count / totalCount) * 10000) / 100 : 0,
        revenuePercentage: totalRevenue > 0 ? Math.round((value.revenue / totalRevenue) * 10000) / 100 : 0,
      }));
  }
}
