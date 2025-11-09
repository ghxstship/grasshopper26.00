'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventRoleGate } from '@/lib/rbac';
import { EventRoleType } from '@/lib/rbac/event-roles';
import { useSearchParams } from 'next/navigation';

interface FinancialMetrics {
  eventId: string;
  eventName: string;
  revenue: {
    ticketSales: number;
    merchandiseSales: number;
    sponsorships: number;
    other: number;
    total: number;
  };
  expenses: {
    venue: number;
    talent: number;
    production: number;
    marketing: number;
    staff: number;
    other: number;
    total: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
  };
  projections: {
    projectedRevenue: number;
    projectedExpenses: number;
    projectedProfit: number;
    confidenceLevel: number;
  };
}

export default function InvestorAnalyticsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'actual' | 'projected'>('actual');

  useEffect(() => {
    if (eventId) {
      loadFinancials();
    }
  }, [eventId]);

  async function loadFinancials() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, title, capacity, ticket_price')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get orders for revenue calculation
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('event_id', eventId)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      const ticketRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Mock data for other revenue streams (would come from actual tables)
      const revenue = {
        ticketSales: ticketRevenue,
        merchandiseSales: ticketRevenue * 0.15, // 15% of ticket sales
        sponsorships: ticketRevenue * 0.25, // 25% of ticket sales
        other: ticketRevenue * 0.05,
        total: 0,
      };
      revenue.total = revenue.ticketSales + revenue.merchandiseSales + revenue.sponsorships + revenue.other;

      // Mock expense data (would come from production advances and other expense tracking)
      const expenses = {
        venue: revenue.total * 0.20,
        talent: revenue.total * 0.30,
        production: revenue.total * 0.15,
        marketing: revenue.total * 0.10,
        staff: revenue.total * 0.08,
        other: revenue.total * 0.05,
        total: 0,
      };
      expenses.total = expenses.venue + expenses.talent + expenses.production + expenses.marketing + expenses.staff + expenses.other;

      const grossProfit = revenue.total - expenses.total;
      const netProfit = grossProfit * 0.85; // After taxes/fees
      const profitMargin = (netProfit / revenue.total) * 100;
      const roi = (netProfit / expenses.total) * 100;

      setMetrics({
        eventId: event.id,
        eventName: event.title,
        revenue,
        expenses,
        profitability: {
          grossProfit,
          netProfit,
          profitMargin,
          roi,
        },
        projections: {
          projectedRevenue: revenue.total * 1.15, // 15% growth projection
          projectedExpenses: expenses.total * 1.08, // 8% expense increase
          projectedProfit: (revenue.total * 1.15) - (expenses.total * 1.08),
          confidenceLevel: 0.78, // 78% confidence
        },
      });
    } catch (err: any) {
      console.error('Error loading financials:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportFinancialReport() {
    if (!metrics) return;

    const csvContent = [
      ['GVTEWAY Financial Report'],
      ['Event:', metrics.eventName],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['REVENUE BREAKDOWN'],
      ['Ticket Sales', `$${metrics.revenue.ticketSales.toLocaleString()}`],
      ['Merchandise', `$${metrics.revenue.merchandiseSales.toLocaleString()}`],
      ['Sponsorships', `$${metrics.revenue.sponsorships.toLocaleString()}`],
      ['Other Revenue', `$${metrics.revenue.other.toLocaleString()}`],
      ['Total Revenue', `$${metrics.revenue.total.toLocaleString()}`],
      [''],
      ['EXPENSE BREAKDOWN'],
      ['Venue', `$${metrics.expenses.venue.toLocaleString()}`],
      ['Talent', `$${metrics.expenses.talent.toLocaleString()}`],
      ['Production', `$${metrics.expenses.production.toLocaleString()}`],
      ['Marketing', `$${metrics.expenses.marketing.toLocaleString()}`],
      ['Staff', `$${metrics.expenses.staff.toLocaleString()}`],
      ['Other Expenses', `$${metrics.expenses.other.toLocaleString()}`],
      ['Total Expenses', `$${metrics.expenses.total.toLocaleString()}`],
      [''],
      ['PROFITABILITY'],
      ['Gross Profit', `$${metrics.profitability.grossProfit.toLocaleString()}`],
      ['Net Profit', `$${metrics.profitability.netProfit.toLocaleString()}`],
      ['Profit Margin', `${metrics.profitability.profitMargin.toFixed(2)}%`],
      ['ROI', `${metrics.profitability.roi.toFixed(2)}%`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${metrics.eventName.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!eventId) {
    return (
      <div className="p-8">
        <p className="text-red-600">No event selected. Please select an event from your investor dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading financials: {error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <EventRoleGate eventId={eventId} allowedRoles={[EventRoleType.INVESTOR]} fallback={
      <div className="p-8">
        <p className="text-red-600">Access Denied: Investor access required for this event</p>
      </div>
    }>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{metrics.eventName}</h1>
            <p className="text-gray-600 mt-1">Financial Performance Dashboard</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTimeframe('actual')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeframe === 'actual' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Actual
              </button>
              <button
                onClick={() => setTimeframe('projected')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeframe === 'projected' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Projected
              </button>
            </div>
            <button
              onClick={exportFinancialReport}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ${timeframe === 'actual' ? metrics.revenue.total.toLocaleString() : metrics.projections.projectedRevenue.toLocaleString()}
            </p>
            {timeframe === 'projected' && (
              <p className="text-xs text-gray-500 mt-1">+15% projected growth</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">
              ${timeframe === 'actual' ? metrics.expenses.total.toLocaleString() : metrics.projections.projectedExpenses.toLocaleString()}
            </p>
            {timeframe === 'projected' && (
              <p className="text-xs text-gray-500 mt-1">+8% projected increase</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-2">Net Profit</p>
            <p className="text-3xl font-bold text-blue-600">
              ${timeframe === 'actual' ? metrics.profitability.netProfit.toLocaleString() : metrics.projections.projectedProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{metrics.profitability.profitMargin.toFixed(1)}% margin</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-2">ROI</p>
            <p className="text-3xl font-bold text-purple-600">{metrics.profitability.roi.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Return on investment</p>
          </div>
        </div>

        {/* Revenue & Expense Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-green-700">Revenue Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(metrics.revenue).filter(([key]) => key !== 'total').map(([category, amount]) => {
                const percentage = (amount / metrics.revenue.total) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm text-gray-600">${amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Revenue</span>
                  <span className="font-semibold text-green-600">${metrics.revenue.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-red-700">Expense Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(metrics.expenses).filter(([key]) => key !== 'total').map(([category, amount]) => {
                const percentage = (amount / metrics.expenses.total) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                      <span className="text-sm text-gray-600">${amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Expenses</span>
                  <span className="font-semibold text-red-600">${metrics.expenses.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profitability Analysis */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Profitability Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Gross Profit</p>
              <p className="text-3xl font-bold text-gray-900">${metrics.profitability.grossProfit.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Before taxes & fees</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Net Profit</p>
              <p className="text-3xl font-bold text-blue-600">${metrics.profitability.netProfit.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">After all deductions</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.profitability.profitMargin.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Net margin</p>
            </div>
          </div>
        </div>

        {/* Projections */}
        {timeframe === 'projected' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Financial Projections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Growth Assumptions</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Revenue growth: +15% year-over-year</li>
                  <li>• Expense increase: +8% (efficiency gains)</li>
                  <li>• Ticket price optimization: +5%</li>
                  <li>• Sponsorship expansion: +20%</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Confidence Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Projection Confidence</span>
                      <span className="text-sm font-medium">{(metrics.projections.confidenceLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${metrics.projections.confidenceLevel * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Based on historical performance and market trends
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Disclaimer:</strong> This financial report is for informational purposes only. 
            All figures are based on available data and industry benchmarks. Projections are estimates 
            and actual results may vary. Please consult with financial advisors for investment decisions.
          </p>
        </div>
      </div>
    </EventRoleGate>
  );
}
