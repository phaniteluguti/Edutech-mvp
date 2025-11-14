import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAttempts() {
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'student@example.com' }
    });

    if (!student) {
      console.log('Student not found');
      return;
    }

    const attempts = await prisma.testAttempt.findMany({
      where: { userId: student.id },
      include: { mockTest: { select: { title: true } } }
    });

    console.log(`Found ${attempts.length} attempts for student@example.com:`);
    attempts.forEach((attempt, i) => {
      console.log(`\n${i + 1}. ID: ${attempt.id}`);
      console.log(`   Test: ${attempt.mockTest.title}`);
      console.log(`   Status: ${attempt.status}`);
      console.log(`   Started: ${attempt.startedAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttempts();
