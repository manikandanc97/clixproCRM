"use client";

import { CRMPageContainer } from '../shared/crm/CRMPageContainer';
import { CRMPageHeader } from '../shared/crm/CRMPageHeader';
import { CRMMetricCard } from '../shared/crm/CRMMetricCard';
import { ANALYTICS_DATA } from '@/data/analytics-mock';
import { PieChart as PieChartIcon, Download, RefreshCw, Calendar, Target, CalendarDays } from 'lucide-react';
import { 
  RevenueOverviewChart, 
  LeadsGrowthChart, 
  PipelineOverviewChart, 
  CustomerGrowthChart,
  MonthlyPerformanceChart,
  ConversionAnalyticsChart
} from './AnalyticsCharts';
import { TopAgents, RecentActivity } from './TopAgents';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AnalyticsDashboard() {
  return (
    <CRMPageContainer>
      <CRMPageHeader
        title="Analytics Dashboard"
        subtitle="Deep dive into your sales performance and customer growth metrics."
        icon={PieChartIcon}
        badge="Enterprise Analytics"
        actions={[
          { label: "Date Range", icon: Calendar, onClick: () => {} },
          { label: "Refresh", icon: RefreshCw, onClick: () => {}, variant: "outline" },
          { label: "Export Report", icon: Download, onClick: () => {}, variant: "emerald" },
        ]}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 space-y-8"
      >
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ANALYTICS_DATA.topStats.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <CRMMetricCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                color={stat.color}
                sparklineData={stat.sparklineData}
                delay={index * 0.1}
              />
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1: Primary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <RevenueOverviewChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <PipelineOverviewChart />
          </motion.div>
        </div>

        {/* Charts Row 2: Growth & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <TopAgents />
          </motion.div>
          <motion.div variants={itemVariants}>
            <LeadsGrowthChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RecentActivity />
          </motion.div>
        </div>

        {/* Charts Row 3: Advanced Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
             <MonthlyPerformanceChart />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <CustomerGrowthChart />
          </motion.div>
        </div>

        {/* Charts Row 4: Specialized Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
           <motion.div variants={itemVariants}>
             <ConversionAnalyticsChart />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-2">
            {/* You can add more insights here or leave as a grid layout */}
             <div className="h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 p-8 flex flex-col justify-center items-center text-center">
                <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                  <PieChartIcon className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Automated Insights</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI has analyzed your data and found that increasing follow-up frequency by 20% could boost conversions by up to 15% next month.
                </p>
                <button className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                  Generate Full AI Report
                </button>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </CRMPageContainer>
  );
}
