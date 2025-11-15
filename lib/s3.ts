import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

/**
 * Generate a signed URL for a video file in S3
 * @param videoUrl - The S3 object key for the video (stored in video.url field)
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL string
 */
export async function getSignedVideoUrl(
  videoUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  if (!videoUrl) {
    throw new Error('Video URL is required');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: videoUrl,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL for video');
  }
}

/**
 * Generate signed URLs for all pages in a workbook folder
 * @param folderPath - The S3 folder path (e.g., "workbooks/optimal-fertility-blueprint/week-1-lungs")
 * @param totalPages - Total number of pages in the workbook
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Array of objects with pageNumber and signed URL
 */
export async function getSignedUrlsForFolder(
  folderPath: string,
  totalPages: number,
  expiresIn: number = 3600
): Promise<Array<{ pageNumber: number; url: string }>> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  if (!folderPath || !totalPages) {
    throw new Error('Folder path and total pages are required');
  }

  try {
    const urlPromises = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const key = `${folderPath}/${pageNumber}.png`;
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      urlPromises.push(
        getSignedUrl(s3Client, command, { expiresIn }).then(url => ({
          pageNumber,
          url,
        }))
      );
    }

    const results = await Promise.all(urlPromises);
    return results;
  } catch (error) {
    console.error('Error generating signed URLs for folder:', error);
    throw new Error('Failed to generate signed URLs for workbook pages');
  }
}

/**
 * Generate a signed URL for a PDF file in S3
 * @param pdfKey - The S3 object key for the PDF (e.g., "pdfs/stress-free-goddess/program-guide.pdf")
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL string
 */
export async function getSignedPdfUrl(
  pdfKey: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  if (!pdfKey) {
    throw new Error('PDF key is required');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: pdfKey,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed PDF URL:', error);
    throw new Error('Failed to generate signed URL for PDF');
  }
}

export { s3Client };
