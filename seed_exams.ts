import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const school = await (prisma as any).school.findFirst();
  const lecturer = await (prisma as any).user.findFirst({ where: { role: 'LECTURER' } });
  if (!school || !lecturer) { console.log('Need school and lecturer first'); return; }

  // Delete old GENERAL seeded exams if any
  const created = await (prisma as any).announcement.createMany({
    data: [
      {
        title: 'CS301: Data Structures',
        message: 'Mid-semester examination for Data Structures. Date: May 14, 09:00 AM. Venue: HALL A. All students are required to be present 15 mins early.',
        type: 'EXAM',
        audienceType: 'ALL',
        schoolId: school.id,
        authorId: lecturer.id,
      },
      {
        title: 'CS302: Database Mgt.',
        message: 'Database Management examination. Date: May 16, 02:00 PM. Venue: MAIN GYM. Bring your student ID and writing materials.',
        type: 'EXAM',
        audienceType: 'ALL',
        schoolId: school.id,
        authorId: lecturer.id,
      },
      {
        title: 'CS401: Software Engineering',
        message: 'Final examination for Software Engineering. Date: May 18, 10:00 AM. Venue: HALL A.',
        type: 'EXAM',
        audienceType: 'ALL',
        schoolId: school.id,
        authorId: lecturer.id,
      },
      {
        title: 'Course Material Update - CS301',
        message: 'New lecture notes for Data Structures have been uploaded. Kindly review before Wednesday class.',
        type: 'MATERIAL',
        audienceType: 'ALL',
        schoolId: school.id,
        authorId: lecturer.id,
      },
      {
        title: 'Supplementary Notes Chapter 8',
        message: "I've uploaded the supplementary notes for Chapter 8. Please review before Wednesday's seminar.",
        type: 'MATERIAL',
        audienceType: 'ALL',
        schoolId: school.id,
        authorId: lecturer.id,
      },
    ],
    skipDuplicates: false,
  });
  console.log('✅ Seeded exam + material announcements:', created.count);
}
main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end(); });
