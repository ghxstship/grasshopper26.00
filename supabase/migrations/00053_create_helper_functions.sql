-- ============================================================================
-- HELPER FUNCTIONS
-- Utility functions for Super Expansion features
-- ============================================================================

-- Function to increment survey responses
CREATE OR REPLACE FUNCTION increment_survey_responses(survey_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE surveys
  SET 
    total_responses = total_responses + 1,
    response_rate = CASE 
      WHEN total_sent > 0 THEN ((total_responses + 1)::DECIMAL / total_sent::DECIMAL) * 100
      ELSE 0
    END
  WHERE id = survey_id;
END;
$$;

-- Function to update budget totals
CREATE OR REPLACE FUNCTION update_budget_totals(budget_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE budgets b
  SET
    total_revenue_actual = COALESCE((
      SELECT SUM(actual_amount)
      FROM budget_line_items
      WHERE budget_id = b.id AND item_type = 'revenue'
    ), 0),
    total_expenses_actual = COALESCE((
      SELECT SUM(actual_amount)
      FROM budget_line_items
      WHERE budget_id = b.id AND item_type = 'expense'
    ), 0)
  WHERE b.id = budget_id;
END;
$$;

-- Function to update ticket tier availability
CREATE OR REPLACE FUNCTION update_ticket_tier_availability(tier_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ticket_tiers tt
  SET
    tickets_sold = COALESCE((
      SELECT COUNT(*)
      FROM tickets
      WHERE tier_id = tt.id AND ticket_status IN ('active', 'checked_in')
    ), 0),
    tickets_available = total_capacity - COALESCE((
      SELECT COUNT(*)
      FROM tickets
      WHERE tier_id = tt.id AND ticket_status IN ('active', 'checked_in')
    ), 0)
  WHERE tt.id = tier_id;
END;
$$;

-- Function to calculate task completion percentage
CREATE OR REPLACE FUNCTION calculate_task_completion(event_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tasks
  FROM tasks
  WHERE tasks.event_id = calculate_task_completion.event_id;
  
  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO completed_tasks
  FROM tasks
  WHERE tasks.event_id = calculate_task_completion.event_id
    AND task_status = 'completed';
  
  RETURN (completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100;
END;
$$;

-- Trigger to update budget totals when line items change
CREATE OR REPLACE FUNCTION trigger_update_budget_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_budget_totals(OLD.budget_id);
    RETURN OLD;
  ELSE
    PERFORM update_budget_totals(NEW.budget_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER budget_line_items_update_totals
  AFTER INSERT OR UPDATE OR DELETE ON budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_budget_totals();

-- Trigger to update ticket tier availability when tickets change
CREATE OR REPLACE FUNCTION trigger_update_ticket_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_ticket_tier_availability(OLD.tier_id);
    RETURN OLD;
  ELSE
    PERFORM update_ticket_tier_availability(NEW.tier_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER tickets_update_availability
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_ticket_availability();
