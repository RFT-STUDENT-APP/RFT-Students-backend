import { PrismaService } from './src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  require('dotenv').config();
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  console.log('Clearing database...');
  
  // Delete everything in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.announcementComment.deleteMany();
  await prisma.announcementLike.deleteMany();
  await prisma.announcement.deleteMany();
  
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.content.deleteMany();
  
  await prisma.enrollment.deleteMany();
  await prisma.classRepAssignment.deleteMany();
  await prisma.course.deleteMany();
  
  await prisma.anonymousMessage.deleteMany();
  await prisma.admissionRequest.deleteMany();
  await prisma.otp.deleteMany();
  
  // Delete users except SUPER_ADMIN
  await prisma.user.deleteMany({
    where: {
      role: { not: 'SUPER_ADMIN' }
    }
  });
  
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.school.deleteMany();
  
  console.log('Database cleared (Platform Admins retained).');
  
  // Clear uploads directory
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    let count = 0;
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file !== '.gitkeep' && file !== '.gitignore' && file !== 'dummy.pdf') {
        fs.unlinkSync(path.join(uploadsDir, file));
        count++;
      }
    }
    console.log(`Uploads directory cleared (${count} files deleted).`);
  }
  
  await prisma.onModuleDestroy();
}

main().catch(console.error);
