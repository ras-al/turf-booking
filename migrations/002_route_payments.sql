-- ═════════════════════════════════════════════════════════════════════
-- PLAYFIELD Migration: 002_route_payments.sql
-- Razorpay Route Payments, Slot Holds, Confirmations, Cancellations
-- ═════════════════════════════════════════════════════════════════════

-- 1. Update check constraint on slots.status to include 'pending'
ALTER TABLE slots DROP CONSTRAINT IF EXISTS slots_status_check;
ALTER TABLE slots ADD CONSTRAINT slots_status_check 
  CHECK (status IN ('available', 'pending', 'booked', 'blocked'));

-- Update check constraint on bookings.status to include 'pending_payment' and 'expired'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'cancelled', 'completed', 'expired'));

-- 2. Add columns for slot holds and owner's linked Razorpay account
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT;

-- 3. New function: hold_slots
-- Same locking pattern as book_slots(), but marks booking as 'pending_payment'
-- and puts slots into 'pending' with a 10-minute hold
CREATE OR REPLACE FUNCTION public.hold_slots(
  p_user_id UUID,
  p_turf_id UUID,
  p_slot_ids UUID[],
  p_total_amount INT,
  p_notes TEXT DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_booking bookings;
  v_unavailable INT;
BEGIN
  -- Lock the slots to prevent concurrent booking/holding
  PERFORM 1 FROM slots WHERE id = ANY(p_slot_ids) FOR UPDATE;

  SELECT COUNT(*) INTO v_unavailable 
  FROM slots 
  WHERE id = ANY(p_slot_ids) AND status != 'available';

  IF v_unavailable > 0 THEN
    RAISE EXCEPTION 'One or more selected slots are no longer available';
  END IF;

  -- Create booking on hold for 10 minutes
  INSERT INTO bookings (
    user_id,
    turf_id,
    slot_ids,
    total_amount,
    status,
    payment_status,
    hold_expires_at,
    notes
  )
  VALUES (
    p_user_id,
    p_turf_id,
    p_slot_ids,
    p_total_amount,
    'pending_payment',
    'unpaid',
    now() + interval '10 minutes',
    p_notes
  )
  RETURNING * INTO v_booking;

  -- Set slots to pending
  UPDATE slots 
  SET status = 'pending' 
  WHERE id = ANY(p_slot_ids);

  RETURN to_jsonb(v_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. New function: confirm_booking_payment
-- Called when Razorpay webhook captures the payment
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
  p_booking_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_order_id TEXT,
  p_razorpay_signature TEXT DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_booking bookings;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Idempotent return if already confirmed
  IF v_booking.status = 'confirmed' THEN
    RETURN to_jsonb(v_booking);
  END IF;

  -- Lock and set slots to booked
  PERFORM 1 FROM slots WHERE id = ANY(v_booking.slot_ids) FOR UPDATE;
  UPDATE slots SET status = 'booked' WHERE id = ANY(v_booking.slot_ids);

  -- Confirm booking
  UPDATE bookings
  SET status = 'confirmed',
      payment_status = 'paid',
      hold_expires_at = NULL,
      updated_at = now()
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  -- Insert payment record
  INSERT INTO payments (
    booking_id,
    amount,
    method,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status
  )
  VALUES (
    v_booking.id,
    v_booking.total_amount,
    'razorpay',
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_razorpay_signature,
    'captured'
  );

  -- Insert notification
  INSERT INTO notifications (user_id, title, body)
  VALUES (
    v_booking.user_id,
    'Booking Confirmed',
    'Your booking has been confirmed. Booking ID: ' || v_booking.booking_code
  );

  RETURN to_jsonb(v_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. New function: release_expired_holds
-- Releases pending slots and marks bookings expired when hold time has passed
CREATE OR REPLACE FUNCTION public.release_expired_holds()
RETURNS void AS $$
DECLARE
  v_rec RECORD;
BEGIN
  FOR v_rec IN
    SELECT id, slot_ids 
    FROM bookings
    WHERE status = 'pending_payment' AND hold_expires_at < now()
    FOR UPDATE
  LOOP
    -- Release slots to available
    UPDATE slots 
    SET status = 'available' 
    WHERE id = ANY(v_rec.slot_ids) AND status = 'pending';

    -- Mark booking expired
    UPDATE bookings 
    SET status = 'expired', updated_at = now() 
    WHERE id = v_rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. New function: refund_and_cancel_booking
-- Cancels a confirmed booking, checking the 2-hour cutoff rule
CREATE OR REPLACE FUNCTION public.refund_and_cancel_booking(
  p_booking_id UUID,
  p_user_id UUID
) RETURNS jsonb AS $$
DECLARE
  v_booking bookings;
  v_earliest_slot_time TIMESTAMP;
  v_slot_ids UUID[];
BEGIN
  -- Verify booking ownership
  SELECT * INTO v_booking 
  FROM bookings 
  WHERE id = p_booking_id AND user_id = p_user_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or you do not have permission to cancel it';
  END IF;

  IF v_booking.status != 'confirmed' THEN
    RAISE EXCEPTION 'Only confirmed bookings can be cancelled';
  END IF;

  v_slot_ids := v_booking.slot_ids;

  -- Lock slots
  PERFORM 1 FROM slots WHERE id = ANY(v_slot_ids) FOR UPDATE;

  -- Find earliest slot start time
  SELECT MIN(date + start_time) INTO v_earliest_slot_time
  FROM slots
  WHERE id = ANY(v_slot_ids);

  -- Enforce 2-hour rule (against IST)
  IF v_earliest_slot_time IS NOT NULL AND (
    v_earliest_slot_time < ((now() AT TIME ZONE 'Asia/Kolkata') + interval '2 hours')
  ) THEN
    RAISE EXCEPTION 'Cannot cancel within 2 hours of the slot start time';
  END IF;

  -- Mark booking as cancelled
  UPDATE bookings
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_booking_id AND user_id = p_user_id
  RETURNING * INTO v_booking;

  -- Release slots back to available
  UPDATE slots 
  SET status = 'available' 
  WHERE id = ANY(v_slot_ids) AND status = 'booked';

  -- Create cancellation notification
  INSERT INTO notifications (user_id, title, body)
  VALUES (
    p_user_id,
    'Booking Cancelled',
    'Your booking (ID: ' || v_booking.booking_code || ') has been cancelled.'
  );

  RETURN to_jsonb(v_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. Remove client INSERT policy on payments (only service role writes to payments)
DROP POLICY IF EXISTS "Authenticated users can create payments" ON payments;
