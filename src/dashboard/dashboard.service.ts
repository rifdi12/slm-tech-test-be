import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    const [
      totalRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      pendingInvoices,
      overdueCount,
      activeCustomers,
      newCustomers,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', issueDate: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', issueDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.count({
        where: { status: { in: ['DRAFT', 'SENT'] } },
      }),
      this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
    ]);

    const totalRev = totalRevenue._sum.totalAmount || 0;
    const currRev = currentMonthRevenue._sum.totalAmount || 0;
    const lastRev = lastMonthRevenue._sum.totalAmount || 0;
    const revenueGrowth = lastRev > 0 ? ((currRev - lastRev) / lastRev) * 100 : 0;

    const monthlyRevenue = await this.getMonthlyRevenue();

    return {
      totalRevenue: totalRev,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      pendingInvoices,
      overdueInvoices: overdueCount,
      activeCustomers,
      newCustomersThisWeek: newCustomers,
      monthlyRevenue,
      recentInvoices,
    };
  }

  private async getMonthlyRevenue() {
    const months = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = date.toLocaleString('en-US', { month: 'short' });

      const result = await this.prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          issueDate: { gte: date, lt: nextDate },
        },
        _sum: { totalAmount: true },
      });

      months.push({
        month: label,
        actual: result._sum.totalAmount || 0,
        target: 20000,
      });
    }

    return months;
  }

  async getInvoiceStats() {
    const [draft, sent, paid, overdue] = await Promise.all([
      this.prisma.invoice.count({ where: { status: 'DRAFT' } }),
      this.prisma.invoice.count({ where: { status: 'SENT' } }),
      this.prisma.invoice.count({ where: { status: 'PAID' } }),
      this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
    ]);

    const totalOutstanding = await this.prisma.invoice.aggregate({
      where: { status: { in: ['SENT', 'OVERDUE'] } },
      _sum: { totalAmount: true },
    });

    const totalPaid = await this.prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    });

    const overdueBalance = await this.prisma.invoice.aggregate({
      where: { status: 'OVERDUE' },
      _sum: { totalAmount: true },
    });

    return {
      counts: { draft, sent, paid, overdue },
      totalOutstanding: totalOutstanding._sum.totalAmount || 0,
      totalPaid: totalPaid._sum.totalAmount || 0,
      overdueBalance: overdueBalance._sum.totalAmount || 0,
    };
  }
}
