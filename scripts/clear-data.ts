import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log('🗑️  Clearing user and purchase data...');

    // Delete in order to respect foreign key constraints
    const deletedUserProgress = await prisma.userProgress.deleteMany({});
    console.log(`✓ Deleted ${deletedUserProgress.count} user progress records`);

    const deletedWorkbookProgress = await prisma.workbookProgress.deleteMany({});
    console.log(`✓ Deleted ${deletedWorkbookProgress.count} workbook progress records`);

    const deletedEmailDeliveries = await prisma.emailDelivery.deleteMany({});
    console.log(`✓ Deleted ${deletedEmailDeliveries.count} email delivery records`);

    const deletedPurchases = await prisma.purchase.deleteMany({});
    console.log(`✓ Deleted ${deletedPurchases.count} purchases`);

    const deletedPasswordTokens = await prisma.passwordResetToken.deleteMany({});
    console.log(`✓ Deleted ${deletedPasswordTokens.count} password reset tokens`);

    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✓ Deleted ${deletedSessions.count} sessions`);

    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✓ Deleted ${deletedAccounts.count} accounts`);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${deletedUsers.count} users`);

    console.log('✅ All user and purchase data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
