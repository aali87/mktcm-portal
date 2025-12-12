import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the bonus workbook
  const bonusWorkbook = await prisma.workbook.findUnique({
    where: { slug: 'bonus-workbook' }
  });

  if (!bonusWorkbook) {
    console.log('Bonus workbook not found');
    await prisma.$disconnect();
    return;
  }

  // Find videos incorrectly assigned to bonus workbook
  const bonusVideos = await prisma.workbookVideo.findMany({
    where: { workbookId: bonusWorkbook.id }
  });

  console.log('Found bonus videos to delete:', bonusVideos.length);
  bonusVideos.forEach(v => console.log(`  - ${v.title} (${v.s3Key})`));

  // Delete them
  const result = await prisma.workbookVideo.deleteMany({
    where: { workbookId: bonusWorkbook.id }
  });

  console.log(`\nDeleted ${result.count} incorrectly assigned bonus videos`);

  await prisma.$disconnect();
}

main();
