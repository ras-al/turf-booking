import crypto from 'crypto';

export async function POST(request: Request) {
  const { folder } = await request.json();

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return Response.json(
      { error: 'Cloudinary credentials not configured' },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder: folder || 'playfield/turfs',
  };

  // Generate signature: sort params alphabetically, join with &, append api_secret
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  return Response.json({
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName,
    folder: paramsToSign.folder,
  });
}
