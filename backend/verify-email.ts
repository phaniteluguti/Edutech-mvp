import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEmail() {
  try {
    const email = 'phani.kumar131@gmail.com';
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
      },
    });

    console.log('✅ Email verified successfully!');
    console.log('User:', user.name);
    console.log('Email:', user.email);
    console.log('Email Verified:', user.isEmailVerified);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmail();
