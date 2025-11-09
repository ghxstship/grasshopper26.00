/**
 * AI-Powered Event Insights
 * Predictive analytics and recommendations for event optimization
 */

import { createClient } from '@/lib/supabase/client';

export interface AttendancePrediction {
  predicted_attendance: number;
  confidence_level: number;
  factors: {
    historical_average: number;
    day_of_week_factor: number;
    time_of_year_factor: number;
    pricing_factor: number;
    marketing_factor: number;
  };
  recommendation: string;
}

export interface PricingRecommendation {
  recommended_price: number;
  price_range: {
    min: number;
    optimal: number;
    max: number;
  };
  reasoning: string[];
  expected_revenue: number;
  expected_attendance: number;
}

export interface ChurnRisk {
  user_id: string;
  risk_score: number; // 0-1
  risk_level: 'low' | 'medium' | 'high';
  factors: {
    days_since_last_event: number;
    credits_unused: number;
    engagement_score: number;
    ticket_purchase_frequency: number;
  };
  recommended_actions: string[];
}

export interface EventSummary {
  event_id: string;
  summary: string;
  highlights: string[];
  key_metrics: {
    total_attendance: number;
    revenue: number;
    satisfaction_score: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  recommendations: string[];
}

/**
 * Predict event attendance based on historical data and current factors
 */
export async function predictAttendance(eventId: string): Promise<AttendancePrediction> {
  const supabase = createClient();

  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*, venue:venues(capacity)')
    .eq('id', eventId)
    .single();

  if (!event) throw new Error('Event not found');

  // Get historical data for similar events
  const { data: historicalEvents } = await supabase
    .from('events')
    .select(`
      id,
      capacity,
      start_date,
      ticket_price,
      tickets:tickets(count)
    `)
    .eq('venue_id', event.venue_id)
    .limit(10);

  // Calculate historical average
  const historicalAverage = (historicalEvents?.reduce((sum: number, e: any) => {
    const ticketCount = Array.isArray(e.tickets) ? e.tickets.length : 0;
    return sum + ticketCount;
  }, 0) || 0) / (historicalEvents?.length || 1);

  // Day of week factor (weekends typically 1.2x, weekdays 0.8x)
  const eventDate = new Date(event.start_date);
  const dayOfWeek = eventDate.getDay();
  const dayOfWeekFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 0.8;

  // Time of year factor (summer/holidays 1.3x, winter 0.9x)
  const month = eventDate.getMonth();
  const timeOfYearFactor = (month >= 5 && month <= 8) ? 1.3 : 
                          (month === 11 || month === 0) ? 1.2 : 0.9;

  // Pricing factor (lower price = higher attendance, normalized)
  const avgPrice = ((historicalEvents?.reduce((sum: number, e: any) => sum + (e.ticket_price || 0), 0) || 0) / 
                   (historicalEvents?.length || 1)) || 50;
  const pricingFactor = event.ticket_price ? avgPrice / event.ticket_price : 1.0;

  // Marketing factor (placeholder - would integrate with actual marketing data)
  const marketingFactor = 1.1; // Assume 10% boost from marketing

  // Calculate prediction
  const basePrediction = historicalAverage * dayOfWeekFactor * timeOfYearFactor * 
                        pricingFactor * marketingFactor;
  
  const predicted_attendance = Math.min(
    Math.round(basePrediction),
    event.venue?.capacity || event.capacity || basePrediction
  );

  // Confidence based on data availability
  const confidence_level = Math.min(
    0.5 + (historicalEvents?.length || 0) * 0.05,
    0.95
  );

  // Generate recommendation
  const capacityUtilization = predicted_attendance / ((event.capacity as number) || 1);
  let recommendation = '';
  
  if (capacityUtilization < 0.5) {
    recommendation = 'Consider increasing marketing efforts or adjusting pricing to boost attendance.';
  } else if (capacityUtilization > 0.9) {
    recommendation = 'High demand predicted. Consider adding more capacity or creating a waitlist.';
  } else {
    recommendation = 'Attendance prediction looks healthy. Continue current strategy.';
  }

  return {
    predicted_attendance,
    confidence_level,
    factors: {
      historical_average: historicalAverage,
      day_of_week_factor: dayOfWeekFactor,
      time_of_year_factor: timeOfYearFactor,
      pricing_factor: pricingFactor,
      marketing_factor: marketingFactor,
    },
    recommendation,
  };
}

/**
 * Generate optimal pricing recommendation based on demand and market factors
 */
export async function recommendPricing(eventId: string): Promise<PricingRecommendation> {
  const supabase = createClient();

  // Get event and historical pricing data
  const { data: event } = await supabase
    .from('events')
    .select('*, tickets(count)')
    .eq('id', eventId)
    .single();

  if (!event) throw new Error('Event not found');

  // Get similar events pricing
  const { data: similarEvents } = await supabase
    .from('events')
    .select('ticket_price, capacity, tickets(count)')
    .eq('venue_id', event.venue_id)
    .not('ticket_price', 'is', null)
    .limit(20);

  // Calculate market average
  const avgMarketPrice = ((similarEvents?.reduce((sum: number, e: any) => sum + (e.ticket_price || 0), 0) || 0) / 
                        (similarEvents?.length || 1)) || 50;

  // Calculate demand factor
  const currentTicketCount = Array.isArray(event.tickets) ? event.tickets.length : 0;
  const demandFactor = currentTicketCount / ((event.capacity as number) || 1);

  // Base recommendation on market price with demand adjustment
  const basePrice = avgMarketPrice;
  const demandAdjustment = demandFactor > 0.7 ? 1.2 : demandFactor < 0.3 ? 0.85 : 1.0;
  
  const recommended_price = Math.round(basePrice * demandAdjustment);
  
  const price_range = {
    min: Math.round(recommended_price * 0.8),
    optimal: recommended_price,
    max: Math.round(recommended_price * 1.3),
  };

  // Generate reasoning
  const reasoning: string[] = [];
  
  if (demandFactor > 0.7) {
    reasoning.push('High demand detected - premium pricing recommended');
  } else if (demandFactor < 0.3) {
    reasoning.push('Low demand - competitive pricing recommended to boost sales');
  } else {
    reasoning.push('Moderate demand - market-rate pricing recommended');
  }

  reasoning.push(`Market average: $${avgMarketPrice.toFixed(2)}`);
  reasoning.push(`Current capacity utilization: ${(demandFactor * 100).toFixed(1)}%`);

  // Predict outcomes
  const attendancePrediction = await predictAttendance(eventId);
  const expected_attendance = Math.round(attendancePrediction.predicted_attendance * 
                                        (demandAdjustment > 1 ? 0.9 : 1.1));
  const expected_revenue = expected_attendance * recommended_price;

  return {
    recommended_price,
    price_range,
    reasoning,
    expected_revenue,
    expected_attendance,
  };
}

/**
 * Identify members at risk of churning
 */
export async function identifyChurnRisks(limit: number = 50): Promise<ChurnRisk[]> {
  const supabase = createClient();

  // Get active memberships with usage data
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      user_id,
      credits_remaining,
      user_profiles!inner(
        id,
        created_at,
        tickets(
          id,
          created_at,
          orders!inner(event_id, created_at)
        )
      )
    `)
    .eq('status', 'active')
    .limit(limit * 2); // Get more to filter

  if (!memberships) return [];

  const risks: ChurnRisk[] = [];

  for (const membership of memberships) {
    const profile = membership.user_profiles as any;
    if (!profile) continue;

    // Calculate factors
    const tickets = Array.isArray(profile.tickets) ? profile.tickets : [];
    const lastTicketDate = tickets.length > 0 
      ? new Date(Math.max(...tickets.map((t: any) => new Date(t.created_at).getTime())))
      : new Date(profile.created_at);
    
    const days_since_last_event = Math.floor(
      (Date.now() - lastTicketDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const credits_unused = membership.credits_remaining || 0;
    
    // Engagement score (0-1)
    const engagement_score = Math.max(0, 1 - (days_since_last_event / 90));
    
    // Ticket purchase frequency (tickets per month)
    const accountAge = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const ticket_purchase_frequency = tickets.length / Math.max(accountAge, 1);

    // Calculate risk score (0-1, higher = more risk)
    const risk_score = Math.min(1, (
      (days_since_last_event / 90) * 0.4 +
      (credits_unused > 5 ? 0.3 : 0) +
      (1 - engagement_score) * 0.2 +
      (ticket_purchase_frequency < 0.5 ? 0.1 : 0)
    ));

    // Determine risk level
    let risk_level: 'low' | 'medium' | 'high';
    if (risk_score > 0.7) risk_level = 'high';
    else if (risk_score > 0.4) risk_level = 'medium';
    else risk_level = 'low';

    // Generate recommendations
    const recommended_actions: string[] = [];
    
    if (days_since_last_event > 60) {
      recommended_actions.push('Send personalized event recommendations');
    }
    if (credits_unused > 3) {
      recommended_actions.push('Remind about unused credits expiring soon');
    }
    if (engagement_score < 0.5) {
      recommended_actions.push('Offer exclusive early access to popular events');
    }
    if (ticket_purchase_frequency < 0.3) {
      recommended_actions.push('Send curated event digest based on preferences');
    }

    if (risk_level !== 'low') {
      risks.push({
        user_id: membership.user_id,
        risk_score,
        risk_level,
        factors: {
          days_since_last_event,
          credits_unused,
          engagement_score,
          ticket_purchase_frequency,
        },
        recommended_actions,
      });
    }
  }

  // Sort by risk score and limit
  return risks
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, limit);
}

/**
 * Generate AI-powered event summary
 */
export async function generateEventSummary(eventId: string): Promise<EventSummary> {
  const supabase = createClient();

  // Get comprehensive event data
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      tickets(id, status, price),
      orders(id, total_amount, status)
    `)
    .eq('id', eventId)
    .single();

  if (!event) throw new Error('Event not found');

  // Calculate metrics
  const tickets = Array.isArray(event.tickets) ? event.tickets : [];
  const orders = Array.isArray(event.orders) ? event.orders : [];
  
  const total_attendance = tickets.filter((t: any) => t.status === 'checked_in').length;
  const revenue = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
  
  // Mock satisfaction score (would integrate with actual feedback)
  const satisfaction_score = 4.2;

  // Generate highlights
  const highlights: string[] = [];
  const capacityUtilization = total_attendance / (event.capacity || 1);
  
  if (capacityUtilization > 0.9) {
    highlights.push('Sold out event with exceptional attendance');
  } else if (capacityUtilization > 0.7) {
    highlights.push('Strong attendance exceeding 70% capacity');
  }

  if (revenue > 10000) {
    highlights.push(`Generated $${(revenue / 1000).toFixed(1)}K in revenue`);
  }

  if (satisfaction_score >= 4.0) {
    highlights.push('High attendee satisfaction ratings');
  }

  // Determine sentiment
  const sentiment: 'positive' | 'neutral' | 'negative' = 
    capacityUtilization > 0.7 && satisfaction_score >= 4.0 ? 'positive' :
    capacityUtilization < 0.4 || satisfaction_score < 3.0 ? 'negative' :
    'neutral';

  // Generate summary
  const summary = `${event.title} achieved ${(capacityUtilization * 100).toFixed(0)}% capacity with ${total_attendance} attendees, generating $${revenue.toLocaleString()} in revenue. Overall event performance was ${sentiment} with a ${satisfaction_score.toFixed(1)}/5.0 satisfaction rating.`;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (capacityUtilization < 0.6) {
    recommendations.push('Consider adjusting pricing or increasing marketing for similar future events');
  }
  if (satisfaction_score < 4.0) {
    recommendations.push('Review attendee feedback to identify areas for improvement');
  }
  if (capacityUtilization > 0.95) {
    recommendations.push('High demand - consider larger venue or additional dates for similar events');
  }

  return {
    event_id: eventId,
    summary,
    highlights,
    key_metrics: {
      total_attendance,
      revenue,
      satisfaction_score,
    },
    sentiment,
    recommendations,
  };
}

/**
 * Get comprehensive insights for an event
 */
export async function getEventInsights(eventId: string) {
  const [attendance, pricing, summary] = await Promise.all([
    predictAttendance(eventId),
    recommendPricing(eventId),
    generateEventSummary(eventId).catch(() => null), // May fail for upcoming events
  ]);

  return {
    attendance_prediction: attendance,
    pricing_recommendation: pricing,
    event_summary: summary,
  };
}
