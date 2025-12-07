import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete in order to respect foreign key constraints
  const progress = await prisma.workbookVideoProgress.deleteMany({});
  console.log('Deleted workbook video progress:', progress.count);

  const workbookProgress = await prisma.workbookProgress.deleteMany({});
  console.log('Deleted workbook progress:', workbookProgress.count);

  const userProgress = await prisma.userProgress.deleteMany({});
  console.log('Deleted user progress:', userProgress.count);

  const purchases = await prisma.purchase.deleteMany({});
  console.log('Deleted purchases:', purchases.count);

  const sessions = await prisma.session.deleteMany({});
  console.log('Deleted sessions:', sessions.count);

  const accounts = await prisma.account.deleteMany({});
  console.log('Deleted accounts:', accounts.count);

  const users = await prisma.user.deleteMany({});
  console.log('Deleted users:', users.count);

  await prisma.$disconnect();
}

main();
