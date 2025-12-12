import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.workbookVideo.findMany({
    include: { workbook: { select: { slug: true, title: true } } },
    orderBy: [{ workbook: { orderIndex: 'asc' } }, { order: 'asc' }]
  });

  let currentWorkbook = '';
  videos.forEach(v => {
    if (v.workbook.slug !== currentWorkbook) {
      currentWorkbook = v.workbook.slug;
      console.log(`\n=== ${v.workbook.slug} (${v.workbook.title}) ===`);
    }
    console.log(`  ${v.order}. ${v.title}`);
    console.log(`     s3Key: ${v.s3Key}`);
  });

  await prisma.$disconnect();
}

main();
