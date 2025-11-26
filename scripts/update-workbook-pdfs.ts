import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update this mapping with your actual S3 PDF paths
 * Format: workbook slug -> S3 key for the PDF
 *
 * INSTRUCTIONS:
 * 1. Upload your original PDF files to S3 at these paths
 * 2. Run this script with --update to set the fileUrl in the database
 */
const WORKBOOK_PDF_PATHS: Record<string, string> = {
  // Week 1-9 workbooks
  'week-1-lungs': 'workbooks/optimal-fertility-blueprint/pdfs/week-1-lungs.pdf',
  'week-2-qi': 'workbooks/optimal-fertility-blueprint/pdfs/week-2-qi.pdf',
  'week-3-spleen': 'workbooks/optimal-fertility-blueprint/pdfs/week-3-spleen.pdf',
  'week-4-kidneys': 'workbooks/optimal-fertility-blueprint/pdfs/week-4-kidneys.pdf',
  'week-5-liver': 'workbooks/optimal-fertility-blueprint/pdfs/week-5-liver.pdf',
  'week-6-heart': 'workbooks/optimal-fertility-blueprint/pdfs/week-6-heart.pdf',
  'week-7-blood': 'workbooks/optimal-fertility-blueprint/pdfs/week-7-blood.pdf',
  'week-8-yin': 'workbooks/optimal-fertility-blueprint/pdfs/week-8-yin.pdf',
  'week-9-yang': 'workbooks/optimal-fertility-blueprint/pdfs/week-9-yang.pdf',
  // Bonus workbook
  'bonus-workbook': 'workbooks/optimal-fertility-blueprint/pdfs/bonus-workbook.pdf',
};

async function updateWorkbookPdfs() {
  console.log('📄 Updating workbook PDF paths...\n');

  // First, list all workbooks to see current state
  const workbooks = await prisma.workbook.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      fileUrl: true,
      s3FolderPath: true,
    },
    orderBy: { orderIndex: 'asc' },
  });

  console.log('Current workbooks:');
  console.log('─'.repeat(80));

  for (const wb of workbooks) {
    console.log(`  ${wb.slug}`);
    console.log(`    Title: ${wb.title}`);
    console.log(`    fileUrl (PDF): ${wb.fileUrl || '(not set)'}`);
    console.log(`    s3FolderPath (images): ${wb.s3FolderPath || '(not set)'}`);
    console.log('');
  }

  console.log('─'.repeat(80));
  console.log('\nUpdating PDF paths based on mapping...\n');

  let updated = 0;
  let skipped = 0;

  for (const [slug, pdfPath] of Object.entries(WORKBOOK_PDF_PATHS)) {
    const workbook = workbooks.find(w => w.slug === slug);

    if (!workbook) {
      console.log(`⚠️  Workbook not found: ${slug}`);
      skipped++;
      continue;
    }

    if (workbook.fileUrl === pdfPath) {
      console.log(`✓ Already set: ${slug}`);
      skipped++;
      continue;
    }

    await prisma.workbook.update({
      where: { slug },
      data: { fileUrl: pdfPath },
    });

    console.log(`✅ Updated: ${slug} → ${pdfPath}`);
    updated++;
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`\n📊 Summary: ${updated} updated, ${skipped} skipped`);
  console.log('\n⚠️  Remember to upload the actual PDF files to S3!');
  console.log('   S3 paths should match the paths in this script.\n');
}

async function listWorkbooks() {
  console.log('📋 Current workbook configuration:\n');

  const workbooks = await prisma.workbook.findMany({
    include: { product: { select: { name: true, slug: true } } },
    orderBy: [{ product: { slug: 'asc' } }, { orderIndex: 'asc' }],
  });

  let currentProduct = '';

  for (const wb of workbooks) {
    if (wb.product.slug !== currentProduct) {
      currentProduct = wb.product.slug;
      console.log(`\n${wb.product.name}`);
      console.log('─'.repeat(50));
    }

    const hasPdf = wb.fileUrl ? '✅ PDF' : '❌ No PDF';
    const hasImages = wb.s3FolderPath ? '✅ Images' : '❌ No Images';

    console.log(`  ${wb.slug}`);
    console.log(`    ${hasPdf} | ${hasImages}`);
    if (wb.fileUrl) console.log(`    PDF: ${wb.fileUrl}`);
    if (wb.s3FolderPath) console.log(`    Images: ${wb.s3FolderPath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--list')) {
      await listWorkbooks();
    } else if (args.includes('--update')) {
      await updateWorkbookPdfs();
    } else {
      console.log('Usage:');
      console.log('  npx tsx scripts/update-workbook-pdfs.ts --list    # List current workbooks');
      console.log('  npx tsx scripts/update-workbook-pdfs.ts --update  # Update PDF paths');
      console.log('\nEdit WORKBOOK_PDF_PATHS in this script to match your S3 structure.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
