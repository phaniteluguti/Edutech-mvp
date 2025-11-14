import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestAttempts() {
  try {
    // Find student user
    const student = await prisma.user.findUnique({
      where: { email: 'student@example.com' }
    });

    if (!student) {
      console.log('Student user not found');
      return;
    }

    console.log(`Found student: ${student.name} (${student.email})`);

    // Delete all test attempts for this user
    const deleted = await prisma.testAttempt.deleteMany({
      where: { userId: student.id }
    });

    console.log(`✅ Deleted ${deleted.count} test attempt(s)`);
    console.log('Student can now retake tests');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestAttempts();
