import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, userId } = body;

    if (!bookingId || !userId) {
      return NextResponse.json({ error: 'bookingId and userId are required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // 1. Fetch booking first to inspect payment status before cancellation
    const { data: bookingBefore, error: fetchBookingError } = await serviceClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (fetchBookingError || !bookingBefore) {
      return NextResponse.json({ error: 'Booking not found or not owned by user' }, { status: 404 });
    }

    // 2. Call refund_and_cancel_booking RPC
    const { data: cancelledBooking, error: cancelError } = await serviceClient.rpc(
      'refund_and_cancel_booking',
      {
        p_booking_id: bookingId,
        p_user_id: userId,
      }
    );

    if (cancelError) {
      console.error('Cancellation error from RPC:', cancelError);
      // Surface 2-hour cutoff rule and other client errors as 400
      return NextResponse.json(
        { error: cancelError.message || 'Cannot cancel booking' },
        { status: 400 }
      );
    }

    // 3. If booking was paid, issue Razorpay refund
    if (bookingBefore.payment_status === 'paid') {
      try {
        const { data: payment } = await serviceClient
          .from('payments')
          .select('*')
          .eq('booking_id', bookingId)
          .eq('status', 'captured')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (payment && payment.razorpay_payment_id) {
          const razorpay = getRazorpayClient();
          await razorpay.payments.refund(payment.razorpay_payment_id, {
            amount: payment.amount,
            speed: 'normal',
          });

          // Mark payment row refunded
          await serviceClient
            .from('payments')
            .update({ status: 'refunded' })
            .eq('id', payment.id);

          // Update booking payment_status
          await serviceClient
            .from('bookings')
            .update({ payment_status: 'refunded' })
            .eq('id', bookingId);
        }
      } catch (refundError: any) {
        console.error('Razorpay refund API error:', refundError);
        // Note: Slot is already cancelled in DB, return error detail
        return NextResponse.json({
          success: true,
          booking: cancelledBooking,
          refundWarning: 'Booking cancelled but refund processing failed: ' + refundError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      booking: cancelledBooking,
    });
  } catch (error: any) {
    console.error('Cancel booking route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
