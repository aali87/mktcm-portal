import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.workbookVideo.findMany({
    select: { id: true, s3Key: true, title: true }
  });
  console.log('Workbook videos in DB:');
  videos.forEach(v => console.log(v.id, '|', v.s3Key));
  await prisma.$disconnect();
}

main();
