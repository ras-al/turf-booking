-- ╔════════════════════════════════════════════════╗
-- ║     TurfBook — Supabase Database Schema        ║
-- ║     Run this in Supabase SQL Editor             ║
-- ╚════════════════════════════════════════════════╝

-- ═══════════════════════════════════════
-- 1. PROFILES TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (for review display etc.)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert for new signups (triggered by function)
CREATE POLICY "Enable insert for auth"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════
-- 2. TURFS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS turfs (
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
  size TEXT, -- '5v5', '7v7', '11v11'
  price_per_hour INTEGER NOT NULL DEFAULT 0, -- in paise (INR × 100)
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  avg_rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;

-- Everyone can view active & approved turfs
CREATE POLICY "Active turfs are viewable by everyone"
  ON turfs FOR SELECT
  USING (true);

-- Owners can insert their own turfs
CREATE POLICY "Owners can insert turfs"
  ON turfs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own turfs
CREATE POLICY "Owners can update own turfs"
  ON turfs FOR UPDATE
  USING (auth.uid() = owner_id);

-- Admins can update any turf (for approvals)
CREATE POLICY "Admins can update any turf"
  ON turfs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════
-- 3. SLOTS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(turf_id, date, start_time)
);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Everyone can view slots
CREATE POLICY "Slots are viewable by everyone"
  ON slots FOR SELECT
  USING (true);

-- Owners can insert slots for their turfs
CREATE POLICY "Owners can insert slots"
  ON slots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM turfs WHERE turfs.id = turf_id AND turfs.owner_id = auth.uid()
    )
  );

-- Owners can update slots for their turfs
CREATE POLICY "Owners can update own turf slots"
  ON slots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM turfs WHERE turfs.id = turf_id AND turfs.owner_id = auth.uid()
    )
  );

-- System (authenticated users) can update slot status when booking
CREATE POLICY "Authenticated users can update slot status"
  ON slots FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════
-- 4. BOOKINGS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  slot_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'unpaid', 'paid', 'refunded')),
  total_amount INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can view bookings for their turfs
CREATE POLICY "Owners can view bookings for own turfs"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM turfs WHERE turfs.id = turf_id AND turfs.owner_id = auth.uid()
    )
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (cancel)
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 5. REVIEWS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, turf_id) -- One review per user per turf
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 6. TRIGGER: Auto-create profile on signup
-- ═══════════════════════════════════════
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

-- Drop if exists to avoid duplicate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════
-- 7. TRIGGER: Update turf avg_rating & total_reviews on review change
-- ═══════════════════════════════════════
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

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_turf_rating();

-- ═══════════════════════════════════════
-- 8. TRIGGER: Auto-update updated_at
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON turfs;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON turfs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON bookings;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════
-- 9. FAVORITES TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS favorites (
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
-- 10. PAYMENTS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS payments (
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
  ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

-- ═══════════════════════════════════════
-- 11. SLOT LOCKING (optimistic hold during checkout)
-- ═══════════════════════════════════════
ALTER TABLE slots ADD COLUMN IF NOT EXISTS held_until TIMESTAMPTZ;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS held_by UUID REFERENCES profiles(id);
