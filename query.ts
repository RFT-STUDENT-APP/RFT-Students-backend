import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const subs = await prisma.subscription.findMany();
  console.log('Subscriptions:', subs);
  const schools = await prisma.school.findMany({ include: { subscriptions: true } });
  console.log('Schools:', JSON.stringify(schools, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
