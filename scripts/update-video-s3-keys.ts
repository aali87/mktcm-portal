import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateVideoS3Keys() {
  console.log('Fetching Free Workshop videos...\n');

  // Get the Free Workshop product
  const product = await prisma.product.findUnique({
    where: { slug: 'free-workshop' },
    include: {
      videos: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) {
    console.error('Free Workshop product not found!');
    return;
  }

  console.log(`Found product: ${product.name}`);
  console.log(`Total videos: ${product.videos.length}\n`);

  // S3 keys for the three videos (stored in url field)
  const s3Keys = [
    'videos/free-workshop/living-vibrantly-day-1.mp4',
    'videos/free-workshop/living-vibrantly-day-2.mp4',
    'videos/free-workshop/living-vibrantly-day-3.mp4',
  ];

  // Update each video with the corresponding S3 key
  for (let i = 0; i < product.videos.length; i++) {
    const video = product.videos[i];
    const s3Key = s3Keys[i];

    console.log(`Updating video ${i + 1}:`);
    console.log(`  ID: ${video.id}`);
    console.log(`  Title: ${video.title}`);
    console.log(`  Current URL: ${video.url || 'null'}`);
    console.log(`  New URL (S3 Key): ${s3Key}`);

    await prisma.video.update({
      where: { id: video.id },
      data: { url: s3Key },
    });

    console.log(`  ✅ Updated!\n`);
  }

  console.log('All videos updated successfully!');

  // Verify the updates
  console.log('\n--- Verification ---');
  const updatedProduct = await prisma.product.findUnique({
    where: { slug: 'free-workshop' },
    include: {
      videos: {
        orderBy: { order: 'asc' },
      },
    },
  });

  updatedProduct?.videos.forEach((video: any, index: number) => {
    console.log(`\nVideo ${index + 1}:`);
    console.log(`  Title: ${video.title}`);
    console.log(`  URL (S3 Key): ${video.url}`);
  });
}

updateVideoS3Keys()
  .catch((error) => {
    console.error('Error updating video S3 keys:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
