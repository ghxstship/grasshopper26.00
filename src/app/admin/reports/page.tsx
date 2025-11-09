'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Badge } from '@/design-system/components/atoms/badge';
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
  color: string;
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
      color: 'text-green-400',
      fields: ['Total Revenue', 'Order Count', 'Average Order Value', 'Payment Methods'],
    },
    {
      id: 'event_performance',
      name: 'Event Performance Report',
      description: 'Detailed analytics for each event',
      icon: Calendar,
      color: 'text-blue-400',
      fields: ['Ticket Sales', 'Revenue', 'Attendance Rate', 'Capacity Utilization'],
    },
    {
      id: 'customer_analytics',
      name: 'Customer Analytics Report',
      description: 'Customer behavior and demographics',
      icon: Users,
      color: 'text-purple-400',
      fields: ['New Customers', 'Repeat Customers', 'Demographics', 'Purchase Patterns'],
    },
    {
      id: 'ticket_sales',
      name: 'Ticket Sales Report',
      description: 'Breakdown of ticket types and sales channels',
      icon: FileText,
      color: 'text-pink-400',
      fields: ['Ticket Types', 'Sales Channels', 'Pricing Tiers', 'Conversion Rates'],
    },
    {
      id: 'revenue_breakdown',
      name: 'Revenue Breakdown Report',
      description: 'Detailed revenue analysis by category',
      icon: TrendingUp,
      color: 'text-orange-400',
      fields: ['Revenue by Event', 'Revenue by Product', 'Fees & Taxes', 'Net Revenue'],
    },
    {
      id: 'refund_analysis',
      name: 'Refund Analysis Report',
      description: 'Refund trends and reasons',
      icon: FileText,
      color: 'text-red-400',
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
      // Add small delay between reports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Reports</h1>
        <p className="text-muted-foreground">
          Generate detailed reports and export data for analysis
        </p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the date range for your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="start-date" className="text-sm font-medium mb-2 block">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="end-date" className="text-sm font-medium mb-2 block">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <Button
              onClick={generateAllReports}
              disabled={!!generating}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-${report.color.split('-')[1]}-500/10`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                {generating === report.id && (
                  <Badge variant="secondary">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Includes:</p>
                <ul className="space-y-1">
                  {report.fields.map((field) => (
                    <li key={field} className="text-sm text-muted-foreground flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => generateReport(report.id)}
                disabled={!!generating}
                className="w-full"
              >
                {generating === report.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Recently generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Report history will appear here</p>
            <p className="text-sm mt-2">Generate your first report to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
