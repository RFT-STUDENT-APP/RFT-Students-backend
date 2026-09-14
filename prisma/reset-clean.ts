import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function resetClean() {
  console.log('🧹 Starting clean reset...');

  // 1. Delete content
  const deletedContent = await prisma.content.deleteMany({});
  console.log(`Deleted ${deletedContent.count} content items`);

  // 2. Delete ClassRepAssignments
  const deletedReps = await prisma.classRepAssignment.deleteMany({});
  console.log(`Deleted ${deletedReps.count} class rep assignments`);

  // 3. Delete Enrollments
  const deletedEnrollments = await prisma.enrollment.deleteMany({});
  console.log(`Deleted ${deletedEnrollments.count} enrollments`);

  // 4. Delete ClassSessions and Assessments if any
  await prisma.classSession.deleteMany({});
  await prisma.assessmentSubmission.deleteMany({});
  await prisma.assessment.deleteMany({});

  // 5. Delete Courses
  const deletedCourses = await prisma.course.deleteMany({});
  console.log(`Deleted ${deletedCourses.count} courses`);

  // 6. Delete Lecturer accounts
  const deletedLecturers = await prisma.user.deleteMany({
    where: { role: 'LECTURER' },
  });
  console.log(`Deleted ${deletedLecturers.count} lecturer accounts`);

  console.log('✅ Clean reset complete!');
}

resetClean()
  .catch((e) => {
    console.error('Reset error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
