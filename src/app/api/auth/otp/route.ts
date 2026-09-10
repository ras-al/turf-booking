import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const { email, mode, role, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
      options: {
        data:
          mode === 'signup'
            ? {
                full_name: name || 'User',
                role: role || 'user',
              }
            : undefined,
        redirectTo: `${req.nextUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error in generateLink:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const otp = data?.properties?.email_otp;
    const actionLink = data?.properties?.action_link;

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║ [PLAYFIELD AUTH] User: ${cleanEmail}`);
    console.log(`║ 🔑 OTP Code: ${otp}`);
    console.log(`║ 🔗 Link: ${actionLink}`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    return NextResponse.json({
      success: true,
      otp: otp || undefined,
      actionLink: actionLink || undefined,
    });
  } catch (err: any) {
    console.error('API OTP route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate OTP' }, { status: 500 });
  }
}
