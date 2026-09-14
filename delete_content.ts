import { PrismaService } from './src/prisma/prisma.service';

async function main() {
  require('dotenv').config();
  const prisma = new PrismaService();
  console.log('Connecting to database...');
  await prisma.onModuleInit();
  
  console.log('Deleting all content...');
  const res = await prisma.content.deleteMany();
  console.log(`Deleted ${res.count} records.`);
  
  await prisma.onModuleDestroy();
}

main().catch(console.error);
