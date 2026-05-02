import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyRevenue(months: number) {
    const now = new Date();
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startMonth = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const records = await this.prisma.revenue.findMany({
      where: {
        periodStart: { gte: startMonth },
        periodEnd: { lte: endOfCurrentMonth },
      },
      select: {
        amount: true,
        periodStart: true,
      },
    });

    const totals = new Map<string, number>();

    for (const record of records) {
      const year = record.periodStart.getFullYear();
      const month = record.periodStart.getMonth() + 1;
      const key = `${year}-${month}`;
      totals.set(key, (totals.get(key) ?? 0) + record.amount);
    }

    const monthsList = Array.from({ length: months }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1) + index, 1);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${monthIndex + 1}`;

      return {
        label: MONTH_LABELS[monthIndex] ?? '',
        amount: totals.get(key) ?? 0,
        year,
        month: monthIndex + 1,
      };
    });

    return { months: monthsList };
  }
}
