import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete workbook videos that have + in the s3Key (old format)
  const deleted = await prisma.workbookVideo.deleteMany({
    where: {
      s3Key: {
        contains: '+'
      }
    }
  });
  console.log('Deleted old workbook videos with + in s3Key:', deleted.count);

  // Verify remaining videos
  const videos = await prisma.workbookVideo.findMany({
    select: { id: true, s3Key: true }
  });
  console.log('\nRemaining videos:');
  videos.forEach(v => console.log(v.id, '|', v.s3Key));

  await prisma.$disconnect();
}

main();
