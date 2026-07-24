# PlayField - Turf Booking Platform

PlayField is a modern, responsive, and full-featured turf booking web application built with Next.js. It connects sports enthusiasts with turf owners, providing a seamless experience for finding, booking, and managing sports facilities.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS, Framer Motion (for animations)
- **State Management:** Zustand, React Query
- **Database & Auth:** Supabase (PostgreSQL)
- **Icons:** Lucide React

## ✨ Features

### For Users
- **Discover Turfs:** Search and filter turfs by location, sports, and availability.
- **Real-Time Booking:** View real-time slot availability and book instantly.
- **Atomic Bookings:** Race-condition-free booking system ensures no double bookings.
- **Reviews & Ratings:** Leave reviews and photos for turfs.
- **Favorites:** Save favorite turfs for quick access.
- **Notifications:** Receive instant updates on booking confirmations and cancellations.

### For Turf Owners
- **List Turfs:** Add new turfs with photos, amenities, sports supported, and pricing.
- **Automated Slot Generation:** Slots are automatically generated based on opening/closing times and slot duration.
- **Dashboard:** Manage bookings, view earnings, and track turf performance.

### For Admins
- **Platform Management:** Approve or reject turf listings.
- **Oversight:** View all platform bookings and users.

## 🗄️ Database Schema

The platform is powered by a robust PostgreSQL database hosted on Supabase. Key tables include:
- **profiles:** User accounts with roles (`user`, `owner`, `admin`).
- **turfs:** Details of the sports facilities.
- **slots:** Time slots for booking (auto-generated).
- **bookings:** User reservations with support for atomic transactions.
- **reviews & favorites:** User engagement data.
- **payments:** Payment tracking (ready for Razorpay integration).
- **notifications:** In-app alerts for users.

## ⚙️ How It Works (Under the Hood)

- **Atomic Booking System:** Uses PostgreSQL row-level locks (`FOR UPDATE`) to ensure that multiple users cannot book the same slot simultaneously.
- **Automated Workflows:** Database triggers automatically handle tasks like updating average ratings when a review is posted, setting `updated_at` timestamps, and auto-generating slots for the next 14 days when a turf is approved.
- **Role-Based Access Control:** Strict Row Level Security (RLS) policies in Supabase ensure that users can only access their own data, while owners and admins have appropriate elevated permissions.

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd turf-booking
```

### 2. Install dependencies
```bash
npm install
```

### 3. Supabase Setup
- Create a new Supabase project.
- Go to the SQL Editor and run the contents of `playfield-schema.sql` to initialize the database schema, functions, triggers, and RLS policies.

### 4. Environment Variables
Create a `.env.local` file in the root directory (based on `.env.example`) and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
