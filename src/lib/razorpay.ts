import Razorpay from 'razorpay';

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Missing Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET)');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}
