import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.video.findMany({
    where: { product: { slug: 'free-workshop' } },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, url: true, order: true }
  });
  console.log('Free Workshop videos:');
  videos.forEach(v => console.log(`${v.order}. ${v.title}\n   url: ${v.url}`));
  await prisma.$disconnect();
}

main();
