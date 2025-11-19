import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    // Only allow for authenticated users
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const bucket = process.env.AWS_S3_BUCKET || '';
    const testKey = 'printables/free-printables/tcm-food-therapy-dampness.pdf';

    console.log('[S3 Test] Testing access to:', { bucket, key: testKey });

    // Try to get object metadata (doesn't download the file, just checks if we can access it)
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: testKey,
    });

    const response = await s3Client.send(command);

    console.log('[S3 Test] Success! Object metadata:', {
      ContentLength: response.ContentLength,
      ContentType: response.ContentType,
      LastModified: response.LastModified,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully accessed S3 object',
      metadata: {
        ContentLength: response.ContentLength,
        ContentType: response.ContentType,
        LastModified: response.LastModified,
      },
    });
  } catch (error: any) {
    console.error('[S3 Test] Error accessing S3:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to access S3',
      errorCode: error.Code || error.$metadata?.httpStatusCode,
      details: error.toString(),
    }, { status: 500 });
  }
}
