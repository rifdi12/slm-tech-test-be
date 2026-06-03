import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard KPI summary' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('invoice-stats')
  @ApiOperation({ summary: 'Get invoice statistics breakdown' })
  getInvoiceStats() {
    return this.dashboardService.getInvoiceStats();
  }
}
