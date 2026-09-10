import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  // Read the raw text first before any JSON parsing to ensure exact byte-for-byte signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured on server');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid Razorpay webhook signature');
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Parse verified webhook body
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Failed to parse webhook JSON:', err);
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  const eventType = event.event;
  console.log(`Received verified Razorpay webhook event: ${eventType}`);

  try {
    const serviceClient = createServiceClient();
    const paymentEntity = event.payload?.payment?.entity;
    const bookingId = paymentEntity?.notes?.booking_id;

    if (eventType === 'payment.captured') {
      if (bookingId) {
        const paymentId = paymentEntity.id;
        const orderId = paymentEntity.order_id;

        const { error: confirmError } = await serviceClient.rpc('confirm_booking_payment', {
          p_booking_id: bookingId,
          p_razorpay_payment_id: paymentId,
          p_razorpay_order_id: orderId,
          p_razorpay_signature: signature,
        });

        if (confirmError) {
          console.error('Error confirming booking via RPC in webhook:', confirmError);
        } else {
          console.log(`Booking ${bookingId} confirmed successfully via payment.captured`);
        }
      } else {
        console.warn('payment.captured event without booking_id in notes');
      }
    } else if (eventType === 'payment.failed') {
      if (bookingId) {
        // Targeted release for this specific booking
        const { data: booking, error: fetchError } = await serviceClient
          .from('bookings')
          .select('id, slot_ids, status')
          .eq('id', bookingId)
          .single();

        if (!fetchError && booking && booking.status === 'pending_payment') {
          if (booking.slot_ids && booking.slot_ids.length > 0) {
            await serviceClient
              .from('slots')
              .update({ status: 'available' })
              .in('id', booking.slot_ids)
              .eq('status', 'pending');
          }

          await serviceClient
            .from('bookings')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('id', bookingId);

          console.log(`Booking ${bookingId} and slots released after payment.failed`);
        }
      }
    }
  } catch (internalError) {
    // Log the error server-side, but return 200 with { received: true } to prevent
    // Razorpay from continuously retrying failed webhooks forever on application-level bugs.
    console.error('Internal processing error in Razorpay webhook handler:', internalError);
  }

  // Always return 200 once signature is verified
  return NextResponse.json({ received: true }, { status: 200 });
}
