import { PrismaClient, Difficulty, QuestionType, VerificationStatus, UserRole, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Seed Previous Year Questions (Core Innovation!)
  console.log('📚 Seeding Previous Year Questions...');
  
  const previousYearQuestions = [
    {
      examType: 'JEE',
      year: 2023,
      session: 'January',
      section: 'Section A',
      questionNumber: 1,
      text: 'If the sum of the series 1 + 2 + 3 + ... + n = 465, then the value of n is:',
      questionType: QuestionType.SINGLE_CHOICE,
      options: ['28', '29', '30', '31'],
      correctAnswer: '30',
      explanation: 'Using the formula for sum of first n natural numbers: n(n+1)/2 = 465. Solving: n² + n - 930 = 0. Using quadratic formula: n = 30.',
      topic: 'Sequences and Series',
      subtopic: 'Arithmetic Progression',
      difficulty: Difficulty.EASY,
      bloomLevel: 'Application',
      conceptsTested: ['Sum of natural numbers', 'Quadratic equations'],
      marks: 4,
      negativeMarks: -1,
      frequency: 3,
      scrapeSource: 'https://example.com/jee-2023-jan.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedBy: 'sme_001',
      verifiedAt: new Date('2023-02-15'),
    },
    {
      examType: 'JEE',
      year: 2023,
      session: 'January',
      section: 'Section A',
      questionNumber: 2,
      text: 'A particle moves along a straight line with velocity v = 3t² - 12t + 9 m/s. At what time does the particle come to rest?',
      questionType: QuestionType.SINGLE_CHOICE,
      options: ['t = 1s or t = 3s', 't = 2s', 't = 0s or t = 4s', 't = 1.5s'],
      correctAnswer: 't = 1s or t = 3s',
      explanation: 'At rest, v = 0. So 3t² - 12t + 9 = 0 → t² - 4t + 3 = 0 → (t-1)(t-3) = 0 → t = 1s or t = 3s',
      topic: 'Kinematics',
      subtopic: 'Motion in One Dimension',
      difficulty: Difficulty.MEDIUM,
      bloomLevel: 'Application',
      conceptsTested: ['Velocity', 'Quadratic equations', 'Motion analysis'],
      marks: 4,
      negativeMarks: -1,
      frequency: 5,
      scrapeSource: 'https://example.com/jee-2023-jan.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedBy: 'sme_002',
      verifiedAt: new Date('2023-02-16'),
    },
    {
      examType: 'NEET',
      year: 2024,
      session: 'May',
      section: 'Physics',
      questionNumber: 5,
      text: 'Two resistors of 4Ω and 6Ω are connected in parallel. What is the equivalent resistance?',
      questionType: QuestionType.NUMERICAL,
      correctAnswer: '2.4',
      explanation: '1/Req = 1/R1 + 1/R2 = 1/4 + 1/6 = (3+2)/12 = 5/12. Therefore Req = 12/5 = 2.4Ω',
      topic: 'Current Electricity',
      subtopic: 'Resistor Combinations',
      difficulty: Difficulty.EASY,
      bloomLevel: 'Knowledge',
      conceptsTested: ['Parallel resistance', 'Circuit analysis'],
      marks: 4,
      negativeMarks: 0,
      frequency: 8,
      scrapeSource: 'https://example.com/neet-2024-may.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedBy: 'sme_001',
      verifiedAt: new Date('2024-06-10'),
    },
    {
      examType: 'JEE',
      year: 2022,
      session: 'April',
      section: 'Section B',
      questionNumber: 15,
      text: 'If matrix A = [[2, 3], [1, 4]], find the determinant of A².',
      questionType: QuestionType.NUMERICAL,
      correctAnswer: '25',
      explanation: 'det(A) = 2×4 - 3×1 = 5. Using property det(A²) = [det(A)]² = 5² = 25',
      topic: 'Matrices and Determinants',
      subtopic: 'Properties of Determinants',
      difficulty: Difficulty.MEDIUM,
      bloomLevel: 'Application',
      conceptsTested: ['Determinants', 'Matrix multiplication', 'Determinant properties'],
      marks: 4,
      negativeMarks: 0,
      frequency: 4,
      scrapeSource: 'https://example.com/jee-2022-apr.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedBy: 'sme_003',
      verifiedAt: new Date('2022-05-20'),
    },
    {
      examType: 'NEET',
      year: 2023,
      session: 'May',
      section: 'Chemistry',
      questionNumber: 12,
      text: 'Which of the following is the strongest acid?',
      questionType: QuestionType.SINGLE_CHOICE,
      options: ['HCl', 'H2SO4', 'HNO3', 'CH3COOH'],
      correctAnswer: 'H2SO4',
      explanation: 'Sulphuric acid (H2SO4) is a dibasic strong acid and completely ionizes in aqueous solution, making it the strongest among the options.',
      topic: 'Acids and Bases',
      subtopic: 'Acid Strength',
      difficulty: Difficulty.EASY,
      bloomLevel: 'Knowledge',
      conceptsTested: ['Acid strength', 'Ionization'],
      marks: 4,
      negativeMarks: -1,
      frequency: 6,
      scrapeSource: 'https://example.com/neet-2023-may.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedBy: 'sme_002',
      verifiedAt: new Date('2023-06-05'),
    },
  ];

  for (const question of previousYearQuestions) {
    await prisma.previousYearQuestion.create({
      data: question,
    });
  }
  console.log(`✅ Created ${previousYearQuestions.length} previous year questions\n`);

  // 2. Seed Sample Exams
  console.log('📝 Seeding Exams...');
  
  const jeeExam = await prisma.exam.create({
    data: {
      name: 'JEE Main',
      slug: 'jee-main',
      description: 'Joint Entrance Examination - Main for engineering admissions',
      syllabus: JSON.stringify({
        physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Modern Physics'],
        chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
        mathematics: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry'],
      }),
      pattern: JSON.stringify({
        totalQuestions: 90,
        sections: [
          { name: 'Section A', questions: 20, type: 'MCQ' },
          { name: 'Section B', questions: 10, type: 'Numerical' },
        ],
      }),
      duration: 180,
      totalMarks: 300,
      negativeMarking: true,
    },
  });

  await prisma.exam.create({
    data: {
      name: 'NEET UG',
      slug: 'neet-ug',
      description: 'National Eligibility cum Entrance Test for medical admissions',
      syllabus: JSON.stringify({
        physics: ['Mechanics', 'Optics', 'Modern Physics'],
        chemistry: ['Physical', 'Organic', 'Inorganic'],
        biology: ['Botany', 'Zoology'],
      }),
      pattern: JSON.stringify({
        totalQuestions: 180,
        sections: [
          { name: 'Physics', questions: 45 },
          { name: 'Chemistry', questions: 45 },
          { name: 'Biology', questions: 90 },
        ],
      }),
      duration: 180,
      totalMarks: 720,
      negativeMarking: true,
    },
  });
  console.log('✅ Created 2 exams (JEE Main, NEET UG)\n');

  // 3. Seed Sample Users
  console.log('👥 Seeding Users...');
  
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      phone: '9876543210',
      passwordHash: hashedPassword,
      name: 'Test Student',
      dateOfBirth: new Date('2006-05-15'),
      isMinor: true,
      parentEmail: 'parent@example.com',
      parentConsentGiven: true,
      parentConsentAt: new Date(),
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@edutech.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'sme@edutech.com',
      passwordHash: hashedPassword,
      name: 'Subject Matter Expert',
      role: UserRole.SME,
      isEmailVerified: true,
    },
  });
  console.log('✅ Created 3 users (Student, Admin, SME)\n');

  // 4. Seed Sample Subscription
  console.log('💳 Seeding Subscriptions...');
  
  await prisma.subscription.create({
    data: {
      userId: studentUser.id,
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      testsPerMonth: 5,
      testsUsed: 0,
    },
  });
  console.log('✅ Created 1 subscription (FREE tier)\n');

  // 5. Seed Sample Mock Test with AI-generated metadata
  console.log('🧪 Seeding Mock Test...');
  
  await prisma.mockTest.create({
    data: {
      examId: jeeExam.id,
      title: 'JEE Main Mock Test 1 - Mathematics',
      description: 'AI-generated mock test based on 2022-2023 previous year patterns',
      totalQuestions: 30,
      duration: 60,
      difficultyMix: JSON.stringify({ easy: 10, medium: 15, hard: 5 }),
      generatedByAI: true,
      generationPrompt: 'Generate 30 questions similar to JEE 2022-2023 mathematics papers',
      previousYearsUsed: 5,
    },
  });
  console.log('✅ Created 1 mock test (AI-generated)\n');

  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Previous Year Questions: ${previousYearQuestions.length}`);
  console.log('   - Exams: 2 (JEE Main, NEET UG)');
  console.log('   - Users: 3 (Student, Admin, SME)');
  console.log('   - Subscriptions: 1 (FREE tier)');
  console.log('   - Mock Tests: 1 (AI-generated)');
  console.log('\n✅ Ready for testing!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
