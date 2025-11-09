'use client';

import { useState, useEffect } from 'react';
import { requireAdmin } from '@/lib/api/middleware';
import { useSearchParams } from 'next/navigation';
import {
  predictAttendance,
  recommendPricing,
  identifyChurnRisks,
  generateEventSummary,
  type AttendancePrediction,
  type PricingRecommendation,
  type ChurnRisk,
  type EventSummary,
} from '@/lib/ai/event-insights';

export default function AIInsightsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [activeTab, setActiveTab] = useState<'attendance' | 'pricing' | 'churn' | 'summary'>('attendance');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [attendancePrediction, setAttendancePrediction] = useState<AttendancePrediction | null>(null);
  const [pricingRec, setPricingRec] = useState<PricingRecommendation | null>(null);
  const [churnRisks, setChurnRisks] = useState<ChurnRisk[]>([]);
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);

  useEffect(() => {
    if (eventId && activeTab === 'attendance') {
      loadAttendancePrediction();
    }
  }, [eventId, activeTab]);

  useEffect(() => {
    if (eventId && activeTab === 'pricing') {
      loadPricingRecommendation();
    }
  }, [eventId, activeTab]);

  useEffect(() => {
    if (activeTab === 'churn') {
      loadChurnRisks();
    }
  }, [activeTab]);

  useEffect(() => {
    if (eventId && activeTab === 'summary') {
      loadEventSummary();
    }
  }, [eventId, activeTab]);

  async function loadAttendancePrediction() {
    if (!eventId) return;
    setLoading(true);
    try {
      const prediction = await predictAttendance(eventId);
      setAttendancePrediction(prediction);
    } catch (error) {
      console.error('Error loading attendance prediction:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPricingRecommendation() {
    if (!eventId) return;
    setLoading(true);
    try {
      const rec = await recommendPricing(eventId);
      setPricingRec(rec);
    } catch (error) {
      console.error('Error loading pricing recommendation:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadChurnRisks() {
    setLoading(true);
    try {
      const risks = await identifyChurnRisks(20);
      setChurnRisks(risks);
    } catch (error) {
      console.error('Error loading churn risks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEventSummary() {
    if (!eventId) return;
    setLoading(true);
    try {
      const summary = await generateEventSummary(eventId);
      setEventSummary(summary);
    } catch (error) {
      console.error('Error loading event summary:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Insights</h1>
        <p className="text-gray-600 mt-1">Predictive analytics and intelligent recommendations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'attendance'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Attendance Prediction
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'pricing'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💰 Pricing Optimization
        </button>
        <button
          onClick={() => setActiveTab('churn')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'churn'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚠️ Churn Risk
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 Event Summary
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Attendance Prediction Tab */}
          {activeTab === 'attendance' && attendancePrediction && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Predicted Attendance</p>
                  <p className="text-5xl font-bold text-purple-600">
                    {attendancePrediction.predicted_attendance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Confidence: {(attendancePrediction.confidence_level * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700">{attendancePrediction.recommendation}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contributing Factors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Historical Average</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(attendancePrediction.factors.historical_average)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Day of Week</p>
                    <p className="text-xl font-bold text-gray-900">
                      {attendancePrediction.factors.day_of_week_factor.toFixed(2)}x
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Time of Year</p>
                    <p className="text-xl font-bold text-gray-900">
                      {attendancePrediction.factors.time_of_year_factor.toFixed(2)}x
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pricing Impact</p>
                    <p className="text-xl font-bold text-gray-900">
                      {attendancePrediction.factors.pricing_factor.toFixed(2)}x
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Marketing Boost</p>
                    <p className="text-xl font-bold text-gray-900">
                      {attendancePrediction.factors.marketing_factor.toFixed(2)}x
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Recommendation Tab */}
          {activeTab === 'pricing' && pricingRec && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Recommended Price</p>
                  <p className="text-5xl font-bold text-green-600">
                    ${pricingRec.recommended_price}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Minimum</p>
                    <p className="text-xl font-semibold text-gray-900">${pricingRec.price_range.min}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Optimal</p>
                    <p className="text-xl font-semibold text-green-600">${pricingRec.price_range.optimal}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Maximum</p>
                    <p className="text-xl font-semibold text-gray-900">${pricingRec.price_range.max}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reasoning</h4>
                  <ul className="space-y-1">
                    {pricingRec.reasoning.map((reason, i) => (
                      <li key={i} className="text-sm text-gray-700">• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-2">Expected Attendance</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pricingRec.expected_attendance.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-2">Expected Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${pricingRec.expected_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Churn Risk Tab */}
          {activeTab === 'churn' && (
            <div className="space-y-4">
              {churnRisks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No high-risk members identified</p>
                </div>
              ) : (
                churnRisks.map((risk) => (
                  <div
                    key={risk.user_id}
                    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                      risk.risk_level === 'high' ? 'border-red-500' :
                      risk.risk_level === 'medium' ? 'border-yellow-500' :
                      'border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">User ID: {risk.user_id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-600">
                          Risk Score: {(risk.risk_score * 100).toFixed(0)}%
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        risk.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        risk.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.risk_level.toUpperCase()} RISK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Days Since Last Event</p>
                        <p className="text-lg font-semibold text-gray-900">{risk.factors.days_since_last_event}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Unused Credits</p>
                        <p className="text-lg font-semibold text-gray-900">{risk.factors.credits_unused}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Engagement Score</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {(risk.factors.engagement_score * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Purchase Frequency</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {risk.factors.ticket_purchase_frequency.toFixed(1)}/mo
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {risk.recommended_actions.map((action, i) => (
                          <li key={i} className="text-sm text-gray-700">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Event Summary Tab */}
          {activeTab === 'summary' && eventSummary && (
            <div className="space-y-6">
              <div className={`rounded-lg p-8 ${
                eventSummary.sentiment === 'positive' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                eventSummary.sentiment === 'negative' ? 'bg-gradient-to-r from-red-50 to-orange-50' :
                'bg-gradient-to-r from-gray-50 to-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Event Summary</h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    eventSummary.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    eventSummary.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {eventSummary.sentiment.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-700 mb-6">{eventSummary.summary}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {eventSummary.key_metrics.total_attendance}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${eventSummary.key_metrics.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {eventSummary.key_metrics.satisfaction_score.toFixed(1)}/5.0
                    </p>
                  </div>
                </div>

                {eventSummary.highlights.length > 0 && (
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                    <ul className="space-y-1">
                      {eventSummary.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-700">✨ {highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eventSummary.recommendations.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {eventSummary.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700">💡 {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
