'use client';

import { useState } from 'react';
import { ContextualPageTemplate } from '@/design-system';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system';
import { Button } from '@/design-system';
import { Badge } from '@/design-system';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import styles from './reports-content.module.css';

type ReportType = 
  | 'sales_summary'
  | 'event_performance'
  | 'customer_analytics'
  | 'ticket_sales'
  | 'revenue_breakdown'
  | 'refund_analysis';

interface Report {
  id: ReportType;
  name: string;
  description: string;
  icon: any;
  fields: string[];
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const reports: Report[] = [
    {
      id: 'sales_summary',
      name: 'Sales Summary Report',
      description: 'Comprehensive overview of all sales activity',
      icon: DollarSign,
      fields: ['Total Revenue', 'Order Count', 'Average Order Value', 'Payment Methods'],
    },
    {
      id: 'event_performance',
      name: 'Event Performance Report',
      description: 'Detailed analytics for each event',
      icon: Calendar,
      fields: ['Ticket Sales', 'Revenue', 'Attendance Rate', 'Capacity Utilization'],
    },
    {
      id: 'customer_analytics',
      name: 'Customer Analytics Report',
      description: 'Customer behavior and demographics',
      icon: Users,
      fields: ['New Customers', 'Repeat Customers', 'Demographics', 'Purchase Patterns'],
    },
    {
      id: 'ticket_sales',
      name: 'Ticket Sales Report',
      description: 'Breakdown of ticket types and sales channels',
      icon: FileText,
      fields: ['Ticket Types', 'Sales Channels', 'Pricing Tiers', 'Conversion Rates'],
    },
    {
      id: 'revenue_breakdown',
      name: 'Revenue Breakdown Report',
      description: 'Detailed revenue analysis by category',
      icon: TrendingUp,
      fields: ['Revenue by Event', 'Revenue by Product', 'Fees & Taxes', 'Net Revenue'],
    },
    {
      id: 'refund_analysis',
      name: 'Refund Analysis Report',
      description: 'Refund trends and reasons',
      icon: FileText,
      fields: ['Refund Rate', 'Refund Reasons', 'Refund Amount', 'Time to Refund'],
    },
  ];

  const generateReport = async (reportType: ReportType) => {
    setGenerating(reportType);

    try {
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          startDate: dateRange.start,
          endDate: dateRange.end,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_${dateRange.start}_to_${dateRange.end}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Report generated and downloaded successfully',
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateAllReports = async () => {
    for (const report of reports) {
      await generateReport(report.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const dateRangeSidebar = (
    <Card>
      <CardHeader>
        <CardTitle>Report Period</CardTitle>
        <CardDescription>Select the date range for your reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.dateFields}>
          <div className={styles.dateField}>
            <label htmlFor="start-date" className={styles.label}>
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="end-date" className={styles.label}>
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={styles.dateInput}
            />
          </div>
          <Button
            onClick={generateAllReports}
            disabled={!!generating}
            variant="outlined"
            className={styles.downloadAllButton}
          >
            <Download className={styles.iconSmall} />
            Download All Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Reports', href: '/admin/reports' }
      ]}
      title="Advanced Reports"
      subtitle="Generate detailed reports and export data for analysis"
      sidebar={dateRangeSidebar}
    >
      {reports.map((report) => (
        <Card key={report.id} className={styles.reportCard}>
          <CardHeader>
            <div className={styles.reportHeader}>
              <div className={styles.iconWrapper}>
                <report.icon className={styles.iconLarge} />
              </div>
              {generating === report.id && (
                <Badge variant="outline">
                  <Loader2 className={styles.spinner} />
                  Generating...
                </Badge>
              )}
            </div>
            <CardTitle>{report.name}</CardTitle>
            <CardDescription>{report.description}</CardDescription>
          </CardHeader>
          <CardContent className={styles.reportContent}>
            <div className={styles.fieldsSection}>
              <p className={styles.fieldsLabel}>Includes:</p>
              <ul className={styles.fieldsList}>
                {report.fields.map((field) => (
                  <li key={field} className={styles.fieldItem}>
                    <CheckCircle2 className={styles.iconSmall} />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={() => generateReport(report.id)}
              disabled={!!generating}
              className={styles.generateButton}
            >
              {generating === report.id ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Generating...
                </>
              ) : (
                <>
                  <Download className={styles.iconSmall} />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </ContextualPageTemplate>
  );
}
