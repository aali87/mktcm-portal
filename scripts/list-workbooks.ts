import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workbooks = await prisma.workbook.findMany({
    orderBy: { orderIndex: 'asc' },
    select: { id: true, slug: true, title: true, orderIndex: true, weekNumber: true }
  });
  console.log('Total workbooks:', workbooks.length);
  workbooks.forEach(w => console.log(`${w.orderIndex}. [${w.slug}] ${w.title}`));
  await prisma.$disconnect();
}

main();
