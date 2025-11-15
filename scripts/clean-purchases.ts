import { prisma } from '../lib/db';

async function cleanPurchases() {
  try {
    console.log('Deleting all purchase records...');

    const result = await prisma.purchase.deleteMany({});

    console.log(`✓ Successfully deleted ${result.count} purchase records`);
    console.log('Database is clean and ready for testing');
  } catch (error) {
    console.error('Error cleaning purchases:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanPurchases();
