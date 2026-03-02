-- Seed today's delivery + yesterday delivered record without hardcoded emails.
-- Optional: set v_customer_email / v_agent_email. If not found, script falls back to latest rows.

DO $$
DECLARE
  v_customer_email TEXT := NULL; -- example: 'customer@example.com'
  v_agent_email TEXT := NULL;    -- example: 'agent@example.com'

  v_customer_id BIGINT;
  v_customer_dairy_id BIGINT;
  v_agent_id BIGINT;
  v_agent_dairy_id BIGINT;
  v_resolved_dairy_id BIGINT;
BEGIN
  SELECT c.id, c.dairy_id
  INTO v_customer_id, v_customer_dairy_id
  FROM public.customers c
  WHERE v_customer_email IS NOT NULL AND lower(c.email) = lower(v_customer_email)
  ORDER BY c.id DESC
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    SELECT c.id, c.dairy_id
    INTO v_customer_id, v_customer_dairy_id
    FROM public.customers c
    ORDER BY c.id DESC
    LIMIT 1;
  END IF;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'No customer found in public.customers';
  END IF;

  SELECT a.id, a.dairy_id
  INTO v_agent_id, v_agent_dairy_id
  FROM public.agents a
  WHERE v_agent_email IS NOT NULL AND lower(a.email) = lower(v_agent_email)
  ORDER BY a.id DESC
  LIMIT 1;

  IF v_agent_id IS NULL THEN
    SELECT a.id, a.dairy_id
    INTO v_agent_id, v_agent_dairy_id
    FROM public.agents a
    ORDER BY a.id DESC
    LIMIT 1;
  END IF;

  v_resolved_dairy_id := COALESCE(v_customer_dairy_id, v_agent_dairy_id);

  -- Remove existing rows for deterministic test output.
  DELETE FROM public.deliveries
  WHERE customer_id = v_customer_id
    AND delivery_date IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day');

  -- Insert today's row.
  INSERT INTO public.deliveries (
    customer_id,
    dairy_id,
    agent_id,
    delivery_date,
    milk_type,
    quantity_liters,
    status,
    notes
  ) VALUES (
    v_customer_id,
    v_resolved_dairy_id,
    v_agent_id,
    CURRENT_DATE,
    'Milk',
    1.0,
    'PENDING',
    'Seeded delivery for tracking test'
  );

  -- Insert yesterday delivered row.
  INSERT INTO public.deliveries (
    customer_id,
    dairy_id,
    agent_id,
    delivery_date,
    milk_type,
    quantity_liters,
    status,
    delivered_at,
    notes
  ) VALUES (
    v_customer_id,
    v_resolved_dairy_id,
    v_agent_id,
    CURRENT_DATE - INTERVAL '1 day',
    'Milk',
    1.0,
    'DELIVERED',
    NOW() - INTERVAL '1 day',
    'Seeded history row'
  );

  RAISE NOTICE 'Seeded deliveries for customer_id=% agent_id=%', v_customer_id, v_agent_id;
END $$;

SELECT id, customer_id, dairy_id, agent_id, delivery_date, milk_type, quantity_liters, status
FROM public.deliveries
ORDER BY delivery_date DESC, id DESC
LIMIT 10;

