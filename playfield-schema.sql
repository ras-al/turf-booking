-- ╔══════════════════════════════════════════════════════╗
-- ║  PlayField — Complete Supabase Schema (Unified)     ║
-- ║  Run this ONCE in Supabase SQL Editor               ║
-- ║  This will DROP all existing tables and recreate    ║
-- ╚══════════════════════════════════════════════════════╝


-- ═══════════════════════════════════════
-- 0. CLEAN SLATE — Drop everything
-- ═══════════════════════════════════════

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_review_change ON reviews;
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
DROP TRIGGER IF EXISTS set_updated_at ON turfs;
DROP TRIGGER IF EXISTS set_updated_at ON bookings;
DROP TRIGGER IF EXISTS trg_turf_approved ON turfs;
DROP TRIGGER IF EXISTS trg_set_booking_code ON bookings;
DROP TRIGGER IF EXISTS trg_set_referral_code ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_turf_rating() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.generate_slots_for_turf(UUID, INT) CASCADE;
DROP FUNCTION IF EXISTS public.on_turf_approved() CASCADE;
DROP FUNCTION IF EXISTS public.book_slots(UUID, UUID, UUID[], INT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.cancel_booking(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.set_booking_code() CASCADE;
DROP FUNCTION IF EXISTS public.set_referral_code() CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS turfs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Also delete ALL auth users (clean slate)
-- WARNING: This removes every user from Supabase Auth
DELETE FROM auth.users;


-- ═══════════════════════════════════════
-- 1. PROFILES TABLE
-- ═══════════════════════════════════════

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for auth"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ═══════════════════════════════════════
-- 2. TURFS TABLE
-- ═══════════════════════════════════════

CREATE TABLE turfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photos TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  sports TEXT[] NOT NULL DEFAULT '{}',
  size TEXT,  -- '5v5', '7v7', '11v11'
  price_per_hour INTEGER NOT NULL DEFAULT 0,  -- stored in paise (INR × 100)
  opening_time TIME NOT NULL DEFAULT '06:00',
  closing_time TIME NOT NULL DEFAULT '23:00',
  slot_duration_minutes INT NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  avg_rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active turfs are viewable by everyone"
  ON turfs FOR SELECT USING (true);

CREATE POLICY "Owners can insert turfs"
  ON turfs FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own turfs"
  ON turfs FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any turf"
  ON turfs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ═══════════════════════════════════════
-- 3. SLOTS TABLE
-- ═══════════════════════════════════════

CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  held_until TIMESTAMPTZ,
  held_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(turf_id, date, start_time)
);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slots are viewable by everyone"
  ON slots FOR SELECT USING (true);

CREATE POLICY "Owners can insert slots"
  ON slots FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM turfs WHERE turfs.id = turf_id AND turfs.owner_id = auth.uid())
  );

CREATE POLICY "Owners can update own turf slots"
  ON slots FOR UPDATE USING (
    EXISTS (SELECT 1 FROM turfs WHERE turfs.id = turf_id AND turfs.owner_id = auth.uid())
  );


-- ═══════════════════════════════════════
-- 4. BOOKINGS TABLE
-- ═══════════════════════════════════════

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  slot_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'unpaid', 'paid', 'refunded')),
  total_amount INTEGER NOT NULL DEFAULT 0,
  booking_code TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owners can view bookings for own turfs"
  ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM turfs WHERE turfs.id = turf_id AND turfs.owner_id = auth.uid())
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 5. REVIEWS TABLE
-- ═══════════════════════════════════════

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, turf_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 6. FAVORITES TABLE
-- ═══════════════════════════════════════

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, turf_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════
-- 7. PAYMENTS TABLE
-- ═══════════════════════════════════════

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'captured', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );


-- ═══════════════════════════════════════
-- 8. NOTIFICATIONS TABLE
-- ═══════════════════════════════════════

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════
--  FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════


-- ─── Auto-create profile on signup ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── Auto-update updated_at timestamp ───
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON turfs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─── Auto-update turf rating on review change ───
CREATE OR REPLACE FUNCTION public.update_turf_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE turfs SET
    avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE turf_id = COALESCE(NEW.turf_id, OLD.turf_id)), 0),
    total_reviews = COALESCE((SELECT COUNT(*) FROM reviews WHERE turf_id = COALESCE(NEW.turf_id, OLD.turf_id)), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.turf_id, OLD.turf_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_turf_rating();


-- ─── Auto-generate referral code on profile creation ───
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := 'PF' || upper(substr(md5(NEW.id::text), 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();


-- ─── Auto-generate booking code on booking creation ───
CREATE OR REPLACE FUNCTION public.set_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_code := 'PF' || upper(substr(md5(NEW.id::text), 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_code();


-- ─── Slot auto-generation function ───
CREATE OR REPLACE FUNCTION public.generate_slots_for_turf(p_turf_id UUID, p_days_ahead INT DEFAULT 14)
RETURNS void AS $$
DECLARE
  t RECORD;
BEGIN
  SELECT opening_time, closing_time, slot_duration_minutes INTO t FROM turfs WHERE id = p_turf_id;
  IF NOT FOUND THEN RETURN; END IF;

  INSERT INTO slots (turf_id, date, start_time, end_time, status)
  SELECT
    p_turf_id,
    d.date::date,
    (t.opening_time + (s.seq * t.slot_duration_minutes || ' minutes')::interval)::time,
    (t.opening_time + ((s.seq + 1) * t.slot_duration_minutes || ' minutes')::interval)::time,
    'available'
  FROM
    generate_series(CURRENT_DATE, CURRENT_DATE + p_days_ahead, '1 day'::interval) d(date)
  CROSS JOIN
    generate_series(
      0,
      (EXTRACT(EPOCH FROM (t.closing_time - t.opening_time))/60 / t.slot_duration_minutes)::int - 1
    ) s(seq)
  WHERE
    (t.opening_time + ((s.seq + 1) * t.slot_duration_minutes || ' minutes')::interval)::time <= t.closing_time
  ON CONFLICT (turf_id, date, start_time) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── Trigger: auto-generate slots when a turf is approved ───
CREATE OR REPLACE FUNCTION public.on_turf_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = true AND (OLD.is_approved IS DISTINCT FROM true) THEN
    PERFORM public.generate_slots_for_turf(NEW.id, 14);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_turf_approved
  AFTER UPDATE ON turfs
  FOR EACH ROW EXECUTE FUNCTION public.on_turf_approved();


-- ═══════════════════════════════════════
-- ATOMIC BOOKING RPC (race-condition-free)
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION public.book_slots(
  p_user_id UUID, p_turf_id UUID, p_slot_ids UUID[], p_total_amount INT, p_notes TEXT DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_booking bookings;
  v_unavailable INT;
BEGIN
  -- Lock the rows first to prevent race conditions
  PERFORM 1 FROM slots WHERE id = ANY(p_slot_ids) FOR UPDATE;

  SELECT COUNT(*) INTO v_unavailable FROM slots WHERE id = ANY(p_slot_ids) AND status != 'available';
  IF v_unavailable > 0 THEN
    RAISE EXCEPTION 'One or more selected slots are no longer available';
  END IF;

  INSERT INTO bookings (user_id, turf_id, slot_ids, total_amount, status, payment_status, notes)
  VALUES (p_user_id, p_turf_id, p_slot_ids, p_total_amount, 'confirmed', 'free', p_notes)
  RETURNING * INTO v_booking;

  UPDATE slots SET status = 'booked' WHERE id = ANY(p_slot_ids);

  -- Create a notification
  INSERT INTO notifications (user_id, title, body)
  VALUES (p_user_id, 'Booking Confirmed', 'Your booking has been confirmed. Booking ID: ' || v_booking.booking_code);

  RETURN to_jsonb(v_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════
-- BOOKING CANCELLATION RPC
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID, p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_booking bookings;
  v_slot_ids UUID[];
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or you do not have permission to cancel it';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'This booking is already cancelled';
  END IF;

  v_slot_ids := v_booking.slot_ids;

  -- Lock slots to prevent race conditions
  PERFORM 1 FROM slots WHERE id = ANY(v_slot_ids) FOR UPDATE;

  -- Cancel the booking
  UPDATE bookings SET status = 'cancelled', updated_at = now()
  WHERE id = p_booking_id AND user_id = p_user_id
  RETURNING * INTO v_booking;

  -- Release slots
  UPDATE slots SET status = 'available' WHERE id = ANY(v_slot_ids) AND status = 'booked';

  -- Notification
  INSERT INTO notifications (user_id, title, body)
  VALUES (p_user_id, 'Booking Cancelled', 'Your booking (ID: ' || v_booking.booking_code || ') has been cancelled.');

  RETURN to_jsonb(v_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════
-- DONE! Now create your admin user.
-- See SETUP.md for instructions.
-- ═══════════════════════════════════════
