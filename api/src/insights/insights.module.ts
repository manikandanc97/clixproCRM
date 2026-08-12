import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { AiInsightsController } from './controllers/ai-insights.controller';

@Module({
  controllers: [
    DashboardController,
    AnalyticsController,
    ReportsController,
    AiInsightsController,
  ],
  providers: [DashboardService, AnalyticsService, ReportsService],
})
export class InsightsModule {}
