import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  let school = await (prisma as any).school.findFirst();
  if (!school) { console.log('No school found — register a school first via platform admin'); return; }
  console.log('School:', school.name);

  let lecturer = await (prisma as any).user.findFirst({ where: { role: 'LECTURER' } });
  if (!lecturer) { console.log('No lecturer found — register a lecturer first'); return; }
  console.log('Lecturer:', lecturer.fullName);

  const testStudent = await (prisma as any).user.findFirst({ where: { email: 'test.student@example.com' } });
  if (testStudent) {
    await (prisma as any).user.update({ where: { id: testStudent.id }, data: { schoolId: school.id } });
    console.log('✅ Linked test student to school');
  }

  const existingCount = await (prisma as any).announcement.count();
  if (existingCount === 0) {
    const course = await (prisma as any).course.findFirst({ where: { schoolId: school.id } });
    await (prisma as any).announcement.createMany({
      data: [
        { title: 'Examination Timetable – 2024 Session', message: 'The examination timetable for the 2024 academic session has been released. CS301: Data Structures – May 14, 09:00 AM. Venue: HALL A', type: 'EXAM', audienceType: 'ALL', schoolId: school.id, authorId: lecturer.id },
        { title: 'Course Material Update - CS301', message: 'New lecture notes and practical exercises for Data Structures have been uploaded. Kindly review them before Wednesday class.', type: 'MATERIAL', audienceType: 'ALL', schoolId: school.id, authorId: lecturer.id, courseId: course?.id || null },
        { title: 'CS301: Data Structures', message: 'Mid-semester examination scheduled. Date: May 14, 09:00 AM. Venue: HALL A', type: 'EXAM', audienceType: 'ALL', schoolId: school.id, authorId: lecturer.id },
        { title: 'CS302: Database Mgt.', message: 'Database Management examination. Date: May 16, 02:00 PM. Venue: MAIN GYM', type: 'EXAM', audienceType: 'ALL', schoolId: school.id, authorId: lecturer.id },
        { title: 'Supplementary Notes Chapter 8', message: "I've uploaded the supplementary notes for Chapter 8. Please review before Wednesday's seminar.", type: 'MATERIAL', audienceType: 'ALL', schoolId: school.id, authorId: lecturer.id, courseId: course?.id || null },
      ],
    });
    console.log('✅ Seeded 5 announcements');
  } else {
    console.log('Skipping announcements —', existingCount, 'already exist');
  }

  const contentCount = await (prisma as any).content.count();
  if (contentCount === 0) {
    const course = await (prisma as any).course.findFirst({ where: { schoolId: school.id } });
    await (prisma as any).content.createMany({
      data: [
        { title: 'Data Structures & Algorithms', type: 'past_question', fileType: 'pdf', downloadUrl: 'http://localhost:3006/uploads/sample_past_question.pdf', visibility: 'public', isPaid: false, price: 0, schoolId: school.id, courseId: course?.id || null, uploaderId: lecturer.id },
        { title: 'Database Management Systems', type: 'past_question', fileType: 'pdf', downloadUrl: 'http://localhost:3006/uploads/sample_past_question.pdf', visibility: 'public', isPaid: false, price: 0, schoolId: school.id, courseId: course?.id || null, uploaderId: lecturer.id },
        { title: 'Computer Architecture & Organization', type: 'past_question', fileType: 'pdf', downloadUrl: 'http://localhost:3006/uploads/sample_past_question.pdf', visibility: 'public', isPaid: false, price: 0, schoolId: school.id, courseId: course?.id || null, uploaderId: lecturer.id },
      ],
    });
    console.log('✅ Seeded 3 past question items');
  } else {
    console.log('Skipping content —', contentCount, 'already exist');
  }

  console.log('\n✅ Done! Pull to refresh on the student app now.');
}
main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end(); });
