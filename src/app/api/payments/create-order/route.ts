import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, turfId, slotIds, totalAmount, notes } = body;

    if (!userId || !turfId || !slotIds || !Array.isArray(slotIds) || slotIds.length === 0 || totalAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // 1. Fetch the turf's owner's razorpay_account_id
    const { data: turfData, error: turfError } = await serviceClient
      .from('turfs')
      .select('owner_id, profiles:owner_id ( razorpay_account_id )')
      .eq('id', turfId)
      .single();

    if (turfError || !turfData) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    const profileData = turfData.profiles as unknown as { razorpay_account_id?: string | null } | null;
    const ownerRazorpayAccountId = profileData?.razorpay_account_id;

    if (!ownerRazorpayAccountId) {
      return NextResponse.json(
        { error: "This turf's owner hasn't set up payouts yet" },
        { status: 409 }
      );
    }

    // Amount in paise (1 INR = 100 paise)
    const orderAmount = Math.round(Number(totalAmount) * 100);

    // 2. Call hold_slots RPC with service-role client
    const { data: booking, error: holdError } = await serviceClient.rpc('hold_slots', {
      p_user_id: userId,
      p_turf_id: turfId,
      p_slot_ids: slotIds,
      p_total_amount: orderAmount,
      p_notes: notes || null,
    });

    if (holdError) {
      console.error('hold_slots error:', holdError);
      return NextResponse.json({ error: holdError.message || 'Failed to hold slots' }, { status: 400 });
    }

    // 3. Determine on_hold_until for Razorpay Route transfer
    // Unix timestamp of the latest slot's date, end of day in IST (+05:30)
    const { data: slotRows } = await serviceClient
      .from('slots')
      .select('date')
      .in('id', slotIds);

    let latestDateStr = new Date().toISOString().split('T')[0];
    if (slotRows && slotRows.length > 0) {
      const dates = slotRows.map((s) => s.date).sort();
      latestDateStr = dates[dates.length - 1];
    }

    const endOfDay = new Date(`${latestDateStr}T23:59:59+05:30`);
    let onHoldUntil = Math.floor(endOfDay.getTime() / 1000);
    const nowSecs = Math.floor(Date.now() / 1000);
    // Ensure on_hold_until is at least in the future
    if (onHoldUntil <= nowSecs) {
      onHoldUntil = nowSecs + 86400; // 24 hours later if date is past
    }

    // 4. Create Razorpay order with transfers to owner's linked account
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: 'INR',
      receipt: booking.booking_code || `PF${booking.id.slice(0, 6).toUpperCase()}`,
      notes: {
        booking_id: booking.id,
      },
      transfers: [
        {
          account: ownerRazorpayAccountId,
          amount: orderAmount,
          currency: 'INR',
          on_hold: true,
          on_hold_until: onHoldUntil,
        },
      ],
    });

    return NextResponse.json({
      bookingId: booking.id,
      orderId: order.id,
      amount: orderAmount,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
