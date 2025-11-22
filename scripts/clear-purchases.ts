import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearPurchases() {
  try {
    console.log('🗑️  Clearing purchase data...');

    // Delete in order to respect foreign key constraints
    const deletedUserProgress = await prisma.userProgress.deleteMany({});
    console.log(`✓ Deleted ${deletedUserProgress.count} user progress records`);

    const deletedWorkbookProgress = await prisma.workbookProgress.deleteMany({});
    console.log(`✓ Deleted ${deletedWorkbookProgress.count} workbook progress records`);

    const deletedPurchases = await prisma.purchase.deleteMany({});
    console.log(`✓ Deleted ${deletedPurchases.count} purchases`);

    console.log('✅ All purchase data cleared successfully!');
    console.log('ℹ️  User accounts remain intact');
  } catch (error) {
    console.error('❌ Error clearing purchases:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearPurchases();
