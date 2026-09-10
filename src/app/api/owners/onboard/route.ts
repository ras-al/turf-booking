import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      legalBusinessName,
      businessType,
      contactName,
      contactPhone,
      street,
      city,
      state,
      postalCode,
      ownerId,
    } = body;

    const targetOwnerId = ownerId || user.id;
    if (targetOwnerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!legalBusinessName || !businessType || !contactName || !contactPhone || !street || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Initialize Razorpay client with server-side keys
    const razorpay = getRazorpayClient();

    // Call Razorpay Route Linked Account creation
    // Cast to any because Razorpay node types sometimes omit accounts in community definitions
    const account = await (razorpay as any).accounts.create({
      type: 'route',
      name: contactName,
      email: user.email,
      phone: contactPhone.replace(/\D/g, '').slice(-10),
      legal_business_name: legalBusinessName,
      business_type: businessType,
      profile: {
        category: 'sports_and_fitness',
        subcategory: 'venue_booking',
        addresses: {
          registered: {
            street1: street,
            city: city,
            state: state,
            postal_code: postalCode,
            country: 'IN',
          },
        },
      },
    });

    if (!account || !account.id) {
      throw new Error('Failed to create Razorpay linked account');
    }

    // Update profiles.razorpay_account_id using service-role client
    const serviceClient = createServiceClient();
    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({ razorpay_account_id: account.id })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      accountId: account.id,
      message: 'Payout account linked successfully',
    });
  } catch (error: any) {
    console.error('Owner onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to onboard owner' },
      { status: 500 }
    );
  }
}
