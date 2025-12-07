import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Old slugs that should be deleted (they were renamed)
  const oldSlugs = [
    'week-4-kidneys',  // renamed to week-4-blood
    'week-6-heart',    // renamed to week-6-shen
    'week-7-blood',    // renamed to week-7-kidneys
    'week-8-yin',      // renamed to week-8-heart
    'week-9-yang',     // renamed to week-9-integration
  ];

  console.log('Deleting old duplicate workbooks...');

  for (const slug of oldSlugs) {
    // First delete associated workbook videos
    const workbook = await prisma.workbook.findUnique({ where: { slug } });
    if (workbook) {
      const deletedVideos = await prisma.workbookVideo.deleteMany({
        where: { workbookId: workbook.id }
      });
      console.log(`Deleted ${deletedVideos.count} videos for ${slug}`);

      // Delete workbook progress
      const deletedProgress = await prisma.workbookProgress.deleteMany({
        where: { workbookId: workbook.id }
      });
      console.log(`Deleted ${deletedProgress.count} progress records for ${slug}`);

      // Delete the workbook
      await prisma.workbook.delete({ where: { slug } });
      console.log(`Deleted workbook: ${slug}`);
    } else {
      console.log(`Workbook not found: ${slug}`);
    }
  }

  // Also need to update the titles of the remaining workbooks (weeks 1-3, 5)
  // since they weren't updated by upsert (slug didn't change)
  console.log('\nUpdating titles for existing workbooks...');

  const titleUpdates = [
    { slug: 'week-1-lungs', title: 'Week 1: Lungs - Strengthen Qi & Immune Function' },
    { slug: 'week-2-qi', title: 'Week 2: Qi - Replenishing Vital Energy & Enhancing Resilience' },
    { slug: 'week-3-spleen', title: 'Week 3: Spleen Qi - Nourishing Your Foundation' },
    { slug: 'week-5-liver', title: 'Week 5: Liver - Restore Flow & Balance' },
  ];

  for (const update of titleUpdates) {
    await prisma.workbook.update({
      where: { slug: update.slug },
      data: { title: update.title }
    });
    console.log(`Updated title for ${update.slug}`);
  }

  console.log('\nCleanup complete!');

  // List remaining workbooks
  const workbooks = await prisma.workbook.findMany({
    orderBy: { orderIndex: 'asc' },
    select: { slug: true, title: true, orderIndex: true }
  });
  console.log('\nRemaining workbooks:', workbooks.length);
  workbooks.forEach(w => console.log(`${w.orderIndex}. [${w.slug}] ${w.title}`));

  await prisma.$disconnect();
}

main();
