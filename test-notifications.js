const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifications = await prisma.notification.findMany();
  console.log("Notifications:", notifications);
  const announcements = await prisma.announcement.findMany();
  console.log("Announcements:", announcements.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
