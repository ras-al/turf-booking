import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const serviceClient = createServiceClient();
    const { error } = await serviceClient.rpc('release_expired_holds');

    if (error) {
      console.error('Error in release_expired_holds RPC:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Expired holds released successfully',
    });
  } catch (error: any) {
    console.error('Cron release-holds error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to release expired holds' },
      { status: 500 }
    );
  }
}
