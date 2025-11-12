/**
 * Webhook Idempotency Helper
 * Prevents duplicate processing of webhook events
 */

import { createClient } from '@/lib/supabase/server'

export interface WebhookEventRecord {
  event_id: string
  event_type: string
  provider: 'stripe' | 'atlvs' | 'resend' | 'other'
  payload?: any
  processing_status: 'success' | 'failed' | 'skipped'
  error_message?: string
}

/**
 * Check if webhook event has already been processed
 * @param eventId - Unique event ID from webhook provider
 * @returns true if event was already processed, false otherwise
 */
export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected for new events
    console.error('Error checking webhook idempotency:', error)
  }
  
  return !!data
}

/**
 * Record webhook event processing
 * @param record - Webhook event record to store
 */
export async function recordWebhookEvent(record: WebhookEventRecord): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('webhook_events')
    .insert({
      event_id: record.event_id,
      event_type: record.event_type,
      provider: record.provider,
      payload: record.payload,
      processing_status: record.processing_status,
      error_message: record.error_message,
    })
  
  if (error) {
    // If error is duplicate key, that's okay - event was already recorded
    if (error.code !== '23505') {
      console.error('Error recording webhook event:', error)
      throw error
    }
  }
}

/**
 * Wrapper function to process webhook with idempotency check
 * @param eventId - Unique event ID from webhook provider
 * @param eventType - Type of webhook event
 * @param provider - Webhook provider name
 * @param processFn - Async function to process the webhook
 * @returns Processing result
 */
export async function processWebhookWithIdempotency<T>(
  eventId: string,
  eventType: string,
  provider: WebhookEventRecord['provider'],
  processFn: () => Promise<T>
): Promise<{ success: boolean; data?: T; skipped?: boolean; error?: string }> {
  // Check if already processed
  const alreadyProcessed = await isWebhookProcessed(eventId)
  
  if (alreadyProcessed) {
    console.log(`Webhook event ${eventId} already processed, skipping`)
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      provider,
      processing_status: 'skipped',
    })
    return { success: true, skipped: true }
  }
  
  try {
    // Process the webhook
    const result = await processFn()
    
    // Record success
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      provider,
      processing_status: 'success',
    })
    
    return { success: true, data: result }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Record failure
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      provider,
      processing_status: 'failed',
      error_message: errorMessage,
    })
    
    return { success: false, error: errorMessage }
  }
}
