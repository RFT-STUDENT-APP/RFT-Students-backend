const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching content...");
  const content = await prisma.content.findMany();
  console.log("Current content:", content);
  
  if (content.length > 0) {
    console.log("Deleting all content...");
    await prisma.content.deleteMany();
    console.log("Content deleted.");
  } else {
    console.log("No content to delete.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
