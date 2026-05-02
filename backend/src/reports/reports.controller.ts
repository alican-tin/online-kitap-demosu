import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  async revenue(@Query('months') months = '6') {
    const parsed = Number(months);
    const count = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 12) : 6;

    return this.reportsService.getMonthlyRevenue(count);
  }
}
