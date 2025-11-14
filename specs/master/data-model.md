# Data Model

**Date**: 2025-11-14  
**Feature**: EduTech Platform MVP  
**ORM**: Prisma 5.x with PostgreSQL 16

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│    User     │       │ Subscription │       │ Transaction  │
│             │1─────*│              │1─────*│              │
│ - id (PK)   │       │ - id (PK)    │       │ - id (PK)    │
│ - email     │       │ - userId(FK) │       │ - subId (FK) │
│ - phone     │       │ - tier       │       │ - amount     │
│ - password  │       │ - status     │       │ - status     │
└──────┬──────┘       │ - validUntil │       │ - razorpayId │
       │              └──────────────┘       └──────────────┘
       │
       │1
       │
       │*
┌──────┴──────────┐       ┌──────────────┐       ┌──────────────┐
│  TestAttempt    │       │ MockTest     │       │   Question   │
│                 │*─────1│              │1─────*│              │
│ - id (PK)       │       │ - id (PK)    │       │ - id (PK)    │
│ - userId (FK)   │       │ - examId(FK) │       │ - mockId(FK) │
│ - mockTestId(FK)│       │ - createdAt  │       │ - text       │
│ - responses     │       │ - difficulty │       │ - options    │
│ - score         │       └──────────────┘       │ - answer     │
│ - startedAt     │                              │ - metadata   │
│ - submittedAt   │                              └──────────────┘
└─────────────────┘
       │1
       │
       │*
┌─────────────────┐       ┌──────────────┐
│ WeakArea        │       │  Exam        │
│                 │       │              │
│ - id (PK)       │       │ - id (PK)    │
│ - userId (FK)   │       │ - name       │
│ - topic         │       │ - type       │
│ - accuracy      │       │ - syllabus   │
│ - lastPracticed │       └──────────────┘
└─────────────────┘
```

## Entities

### 1. PreviousYearQuestion

**Purpose**: Store historical exam questions for AI pattern analysis and generation

```prisma
model PreviousYearQuestion {
  id                String         @id @default(uuid())
  
  // Exam identification
  examType          ExamType
  year              Int            // 2014, 2015, etc.
  session           String?        // "Main", "Advanced", "February", "April"
  section           String         // "Physics", "Chemistry", "Mathematics"
  questionNumber    Int
  
  // Question content
  text              String         @db.Text
  imageUrl          String?        // Azure Blob Storage URL
  questionType      QuestionType
  
  // Options (JSONB for flexibility)
  options           Json?          // ["Option A", "Option B", "Option C", "Option D"] or null for numerical
  
  // Answer
  correctAnswer     Json           // String for MCQ, number for numerical, array for multi-correct
  officialSolution  String         @db.Text
  
  // Classification
  topic             String         // "Mechanics", "Thermodynamics"
  subtopic          String?        // "Newton's Laws", "Laws of Thermodynamics"
  difficulty        Difficulty
  bloomLevel        String         // "Remember", "Understand", "Apply", "Analyze"
  conceptsTested    Json           // ["concept1", "concept2"]
  
  // Weightage & Marking
  marks             Int
  negativeMarks     Decimal?       @db.Decimal(5, 2)
  
  // Pattern Analysis
  frequency         Int            @default(1) // Times this concept appeared
  commonMistakes    Json?          // ["mistake1", "mistake2"]
  
  // Scraping metadata
  scrapeSource      String         // URL or PDF reference
  scrapedAt         DateTime       @default(now())
  verifiedBy        String?        // User ID of content team member
  verifiedAt        DateTime?
  
  // AI usage tracking
  usedInAIPrompts   Int            @default(0) // Count of times used as reference
  lastUsedForAI     DateTime?
  
  // Timestamps
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  @@unique([examType, year, section, questionNumber])
  @@index([examType, topic])
  @@index([year, examType])
  @@index([difficulty])
  @@index([verifiedAt]) // Find verified questions
  @@map("previous_year_questions")
}

enum QuestionType {
  MCQ_SINGLE         // Single correct answer
  MCQ_MULTI          // Multiple correct answers
  NUMERICAL          // Numerical answer
  ASSERTION_REASON   // Assertion-Reason type
  INTEGER            // Integer type answer
}
```

**Validation Rules**:
- `year`: 2010-current year
- `questionNumber`: 1-300 (varies by exam)
- `text`: 10-2000 chars
- `marks`: 1-8 (typical range)
- `frequency`: Auto-incremented when same concept found in new year
- `verifiedAt`: Required before using in AI prompts

**AI Generation Usage**:
```typescript
// Example: Find similar questions for AI prompt
async function getSimilarQuestionsForAI(topic: string, difficulty: Difficulty, limit = 5) {
  const questions = await prisma.previousYearQuestion.findMany({
    where: {
      topic,
      difficulty,
      verifiedAt: { not: null }, // Only verified questions
      examType: 'IIT_JEE' // or user's target exam
    },
    orderBy: {
      year: 'desc' // Prioritize recent patterns
    },
    take: limit
  });
  
  return questions;
}

// Track AI usage
async function markUsedInAIGeneration(questionId: string) {
  await prisma.previousYearQuestion.update({
    where: { id: questionId },
    data: {
      usedInAIPrompts: { increment: 1 },
      lastUsedForAI: new Date()
    }
  });
}
```

**Sample Data**:
```json
{
  "examType": "IIT_JEE",
  "year": 2024,
  "session": "Main - April",
  "section": "Physics",
  "questionNumber": 15,
  "text": "A ball is thrown vertically upward with a velocity of 20 m/s. What is the maximum height reached? (g = 10 m/s²)",
  "questionType": "MCQ_SINGLE",
  "options": ["10 m", "20 m", "30 m", "40 m"],
  "correctAnswer": "20 m",
  "officialSolution": "Using v² = u² + 2as, where v=0 at max height, u=20, a=-10: 0 = 400 - 20h → h = 20m",
  "topic": "Mechanics",
  "subtopic": "Kinematics",
  "difficulty": "MEDIUM",
  "bloomLevel": "Apply",
  "conceptsTested": ["Equations of Motion", "Projectile Motion"],
  "marks": 4,
  "negativeMarks": -1,
  "frequency": 12,
  "commonMistakes": ["Using g = 9.8 instead of 10", "Forgetting final velocity is zero"],
  "scrapeSource": "https://jeemain.nta.nic.in/papers/2024-april.pdf"
}
```

---

### 2. User

**Purpose**: Core user accounts for students and administrators

```prisma
model User {
  id                String         @id @default(uuid())
  email             String         @unique
  phone             String?        @unique
  passwordHash      String
  name              String
  role              UserRole       @default(STUDENT)
  
  // Consent tracking (DPDP Act compliance)
  consentVersion    String?        // Version of T&C agreed
  consentGivenAt    DateTime?
  marketingConsent  Boolean        @default(false)
  
  // Profile
  targetExam        ExamType?      // IIT_JEE, NEET
  preferredLanguage String         @default("en") // en, hi
  
  // Soft delete
  deletedAt         DateTime?
  
  // Timestamps
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  subscriptions     Subscription[]
  testAttempts      TestAttempt[]
  weakAreas         WeakArea[]
  
  @@index([email])
  @@index([role])
  @@index([deletedAt])
  @@map("users")
}

enum UserRole {
  STUDENT
  CONTENT_ADMIN
  SUPER_ADMIN
}

enum ExamType {
  IIT_JEE
  NEET
}
```

**Validation Rules**:
- `email`: Valid email format, max 255 chars
- `phone`: Optional, 10 digits, unique if provided
- `passwordHash`: bcrypt hash (min cost factor 12)
- `name`: 2-100 chars, sanitize for XSS
- `consentVersion`: Required on first login, matches current T&C version
- `targetExam`: Required for students, null for admins

**Indexes**:
- Primary: `id` (UUID)
- Unique: `email`, `phone`
- Lookup: `role` (filter admins), `deletedAt` (active users)

---

### 2. Subscription

**Purpose**: Manage user access tiers and payment tracking

```prisma
model Subscription {
  id              String             @id @default(uuid())
  userId          String
  
  tier            SubscriptionTier
  status          SubscriptionStatus @default(PENDING)
  
  // Validity
  validFrom       DateTime           @default(now())
  validUntil      DateTime?          // null = lifetime
  testsRemaining  Int?               // null = unlimited
  
  // Payment tracking
  amount          Decimal            @db.Decimal(10, 2) // ₹
  currency        String             @default("INR")
  
  // Grace period (7 days from expiry - per clarifications)
  graceExpiresAt  DateTime?
  
  // Metadata
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  // Relations
  user            User               @relation(fields: [userId], references: [id])
  transactions    Transaction[]
  
  @@index([userId])
  @@index([status])
  @@index([validUntil])
  @@map("subscriptions")
}

enum SubscriptionTier {
  FREE           // 1 test
  BUNDLE_10      // ₹499
  BUNDLE_25      // ₹999
  BUNDLE_50      // ₹1699
  UNLIMITED_1M   // ₹799/month
  UNLIMITED_6M   // ₹3999 (₹666/month)
  UNLIMITED_1Y   // ₹6999 (₹583/month)
}

enum SubscriptionStatus {
  PENDING        // Payment initiated
  ACTIVE         // Valid subscription
  EXPIRED        // Past validUntil
  GRACE_PERIOD   // 7 days post-expiry, limited access
  CANCELLED      // User/admin cancelled
}
```

**Validation Rules**:
- `testsRemaining`: ≥0 for bundles, null for unlimited
- `validUntil`: Required for time-based, null for bundles
- `amount`: Must match tier pricing (₹499/999/1699/799/3999/6999)
- `graceExpiresAt`: validUntil + 7 days (auto-calculated)

**Business Logic**:
- **FREE tier**: Auto-assigned on signup, 1 test
- **Upgrades**: New subscription created, old marked CANCELLED
- **Grace period**: `status = GRACE_PERIOD` when `validUntil < now() < graceExpiresAt`
- **Test consumption**: Decrement `testsRemaining` on test submit (bundles only)

---

### 3. Transaction

**Purpose**: Payment tracking and reconciliation

```prisma
model Transaction {
  id              String            @id @default(uuid())
  subscriptionId  String
  
  // Razorpay identifiers
  razorpayOrderId String            @unique
  razorpayPaymentId String?         @unique
  razorpaySignature String?
  
  // Amount
  amount          Decimal           @db.Decimal(10, 2)
  currency        String            @default("INR")
  
  // Status
  status          TransactionStatus @default(PENDING)
  failureReason   String?           // From Razorpay error code
  
  // Metadata
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  completedAt     DateTime?
  
  // Relations
  subscription    Subscription      @relation(fields: [subscriptionId], references: [id])
  
  @@index([subscriptionId])
  @@index([razorpayOrderId])
  @@index([status])
  @@map("transactions")
}

enum TransactionStatus {
  PENDING    // Order created, payment not started
  PROCESSING // Payment initiated
  SUCCESS    // Payment captured
  FAILED     // Payment failed
  REFUNDED   // Payment refunded
}
```

**Validation Rules**:
- `razorpayOrderId`: Format `order_<alphanumeric>` (Razorpay standard)
- `razorpayPaymentId`: Format `pay_<alphanumeric>`, required when status=SUCCESS
- `amount`: Must match subscription.amount
- `failureReason`: Required when status=FAILED

**Webhook Handling**:
```typescript
// On Razorpay webhook payment.captured
async function handlePaymentSuccess(webhookData) {
  // Verify signature
  const isValid = verifyRazorpaySignature(webhookData);
  if (!isValid) throw new Error('Invalid signature');
  
  // Update transaction
  await prisma.transaction.update({
    where: { razorpayOrderId: webhookData.order_id },
    data: {
      razorpayPaymentId: webhookData.payment_id,
      status: 'SUCCESS',
      completedAt: new Date(),
      subscription: {
        update: { status: 'ACTIVE' }
      }
    }
  });
}
```

---

### 4. Exam

**Purpose**: Define exam types (IIT-JEE, NEET) and syllabus

```prisma
model Exam {
  id          String     @id @default(uuid())
  name        String     // "IIT-JEE Main", "NEET"
  type        ExamType
  
  // Syllabus (JSONB for flexibility)
  syllabus    Json       // { "Physics": ["Mechanics", "Thermodynamics"], ... }
  
  // Test configuration
  totalMarks      Int
  totalQuestions  Int
  durationMinutes Int
  
  // Metadata
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relations
  mockTests   MockTest[]
  
  @@index([type])
  @@map("exams")
}
```

**Sample Data**:
```json
{
  "name": "IIT-JEE Main",
  "type": "IIT_JEE",
  "syllabus": {
    "Physics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics"],
    "Chemistry": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"],
    "Mathematics": ["Algebra", "Calculus", "Coordinate Geometry", "Trigonometry"]
  },
  "totalMarks": 300,
  "totalQuestions": 75,
  "durationMinutes": 180
}
```

---

### 5. MockTest

**Purpose**: Individual test instances with generated questions

```prisma
model MockTest {
  id          String       @id @default(uuid())
  examId      String
  
  // Generation metadata
  difficulty  Difficulty   @default(MEDIUM)
  generatedBy String       // "azure_openai_gpt5" or admin user ID
  
  // Status
  isActive    Boolean      @default(true) // Can be taken by users
  
  // Timestamps
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Relations
  exam        Exam         @relation(fields: [examId], references: [id])
  questions   Question[]
  attempts    TestAttempt[]
  
  @@index([examId])
  @@index([isActive, createdAt])
  @@map("mock_tests")
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

**Generation Logic**:
- Azure Function runs nightly (23:00 IST)
- Generates 5 mock tests per exam (EASY: 2, MEDIUM: 2, HARD: 1)
- Validates no question repetition >10% within 30 days for same user

---

### 6. Question

**Purpose**: Individual questions within a mock test

```prisma
model Question {
  id          String   @id @default(uuid())
  mockTestId  String
  
  // Question content
  questionNumber Int    // 1-75 for IIT-JEE
  text        String   @db.Text
  
  // Options (JSONB array)
  options     Json     // ["Option A", "Option B", "Option C", "Option D"]
  
  // Answer
  correctOption Int    // 0-3 index
  
  // Explanation
  explanation String   @db.Text
  
  // Metadata (JSONB for flexibility)
  metadata    Json     // { "topic": "Mechanics", "subtopic": "Newton's Laws", "marks": 4, "bloomLevel": "Apply" }
  
  // Image support (optional)
  imageUrl    String?  // Azure Blob Storage URL
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  // Relations
  mockTest    MockTest @relation(fields: [mockTestId], references: [id], onDelete: Cascade)
  
  @@index([mockTestId, questionNumber])
  @@map("questions")
}
```

**Validation Rules**:
- `text`: 10-1000 chars, sanitize HTML
- `options`: Array of 4 strings, each 1-200 chars
- `correctOption`: 0-3 (index into options array)
- `explanation`: 50-2000 chars
- `metadata.topic`: Must exist in exam.syllabus
- `imageUrl`: Valid HTTPS URL to Azure Blob Storage

**Sample Question**:
```json
{
  "questionNumber": 1,
  "text": "A ball is thrown vertically upward with a velocity of 20 m/s. What is the maximum height reached?",
  "options": ["10 m", "20 m", "30 m", "40 m"],
  "correctOption": 1,
  "explanation": "Using v² = u² + 2as, where v=0 (at max height), u=20, a=-10: 0 = 400 - 20h → h = 20m",
  "metadata": {
    "topic": "Physics",
    "subtopic": "Mechanics",
    "marks": 4,
    "bloomLevel": "Apply"
  }
}
```

---

### 7. TestAttempt

**Purpose**: Track user test-taking sessions and results

```prisma
model TestAttempt {
  id              String           @id @default(uuid())
  userId          String
  mockTestId      String
  
  // Test state
  status          AttemptStatus    @default(IN_PROGRESS)
  
  // Responses (JSONB for flexibility)
  responses       Json             // { "1": 2, "5": 3, ... } (questionNumber → selectedOption)
  
  // Timing
  startedAt       DateTime         @default(now())
  submittedAt     DateTime?
  serverTimestamp DateTime         @default(now()) @updatedAt // For sync conflict resolution
  
  // Scoring
  score           Int?             // null until submitted
  totalMarks      Int?
  percentile      Decimal?         @db.Decimal(5, 2) // 0-100
  
  // Analytics cache (denormalized for performance)
  accuracy        Decimal?         @db.Decimal(5, 2) // % correct
  timeSpent       Int?             // seconds
  
  // Device tracking (for offline sync)
  deviceId        String?
  syncStatus      SyncStatus       @default(SYNCED)
  
  // Denormalized subscription tier (for analytics without joins)
  subscriptionTier String
  
  // Optimistic concurrency control
  version         Int              @default(0)
  
  // Timestamps
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  user            User             @relation(fields: [userId], references: [id])
  mockTest        MockTest         @relation(fields: [mockTestId], references: [id])
  weakAreas       WeakArea[]
  
  @@unique([userId, mockTestId]) // User can attempt each test once
  @@index([userId, createdAt])
  @@index([status])
  @@map("test_attempts")
}

enum AttemptStatus {
  IN_PROGRESS  // Test started, not submitted
  SUBMITTED    // Submitted, awaiting scoring
  SCORED       // Scoring complete
  ABANDONED    // Not submitted within time limit + 5min buffer
}

enum SyncStatus {
  PENDING      // Changes not yet synced to server
  SYNCING      // Sync in progress
  SYNCED       // Latest changes on server
  ERROR        // Sync failed, manual resolution needed
}
```

**Validation Rules**:
- `responses`: Keys must be valid question numbers (1-75), values 0-3
- `score`: 0 ≤ score ≤ totalMarks
- `percentile`: 0.00-100.00
- `timeSpent`: ≤ exam.durationMinutes * 60 + 300 (5min buffer)

**Sync Conflict Resolution**:
```typescript
async function syncResponse(attemptId, questionNumber, selectedOption, clientTimestamp) {
  const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
  
  // Server timestamp always wins
  if (clientTimestamp < attempt.serverTimestamp) {
    throw new Error('Stale update, refresh from server');
  }
  
  // Optimistic locking
  await prisma.testAttempt.update({
    where: { id: attemptId, version: attempt.version },
    data: {
      responses: { ...attempt.responses, [questionNumber]: selectedOption },
      version: { increment: 1 },
      serverTimestamp: new Date()
    }
  });
}
```

---

### 8. WeakArea

**Purpose**: Track topics user struggles with for personalized recommendations

```prisma
model WeakArea {
  id              String   @id @default(uuid())
  userId          String
  testAttemptId   String
  
  // Topic identification
  topic           String   // From question.metadata.topic
  subtopic        String?
  
  // Performance metrics
  accuracy        Decimal  @db.Decimal(5, 2) // % correct in this topic
  questionsAttempted Int
  questionsCorrect   Int
  
  // Practice tracking
  lastPracticedAt DateTime?
  improvementRate Decimal? @db.Decimal(5, 2) // % improvement over last 3 tests
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User         @relation(fields: [userId], references: [id])
  testAttempt     TestAttempt  @relation(fields: [testAttemptId], references: [id])
  
  @@unique([userId, testAttemptId, topic])
  @@index([userId, accuracy]) // Find weakest areas
  @@map("weak_areas")
}
```

**Calculation Logic**:
```typescript
async function updateWeakAreas(attemptId: string) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: { mockTest: { include: { questions: true } } }
  });
  
  const topicStats = {};
  
  attempt.mockTest.questions.forEach((q, idx) => {
    const topic = q.metadata.topic;
    const isCorrect = attempt.responses[q.questionNumber] === q.correctOption;
    
    if (!topicStats[topic]) {
      topicStats[topic] = { attempted: 0, correct: 0 };
    }
    topicStats[topic].attempted++;
    if (isCorrect) topicStats[topic].correct++;
  });
  
  // Create/update weak areas (accuracy < 60%)
  for (const [topic, stats] of Object.entries(topicStats)) {
    const accuracy = (stats.correct / stats.attempted) * 100;
    if (accuracy < 60) {
      await prisma.weakArea.upsert({
        where: { userId_testAttemptId_topic: { userId: attempt.userId, testAttemptId: attemptId, topic } },
        create: {
          userId: attempt.userId,
          testAttemptId: attemptId,
          topic,
          accuracy,
          questionsAttempted: stats.attempted,
          questionsCorrect: stats.correct
        },
        update: { accuracy, questionsAttempted: stats.attempted, questionsCorrect: stats.correct }
      });
    }
  }
}
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Login lookup |
| users | role | Filter admins |
| users | deletedAt | Active users |
| subscriptions | userId | User's subscriptions |
| subscriptions | status, validUntil | Expiry checks |
| transactions | razorpayOrderId | Webhook lookup |
| transactions | subscriptionId | Payment history |
| mock_tests | examId, isActive | Available tests |
| questions | mockTestId, questionNumber | Ordered retrieval |
| test_attempts | userId, createdAt | User history |
| test_attempts | userId, mockTestId | Unique attempt check |
| weak_areas | userId, accuracy | Weakest topics |

---

## Data Migrations

### Initial Migration

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'CONTENT_ADMIN', 'SUPER_ADMIN');
CREATE TYPE "ExamType" AS ENUM ('IIT_JEE', 'NEET');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BUNDLE_10', 'BUNDLE_25', 'BUNDLE_50', 'UNLIMITED_1M', 'UNLIMITED_6M', 'UNLIMITED_1Y');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'GRACE_PERIOD', 'CANCELLED');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'SCORED', 'ABANDONED');
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'ERROR');

-- Run Prisma migrations
npx prisma migrate deploy
```

### Seed Data

```typescript
// prisma/seed.ts
async function main() {
  // Create exams
  await prisma.exam.create({
    data: {
      name: 'IIT-JEE Main',
      type: 'IIT_JEE',
      syllabus: {
        Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism'],
        Chemistry: ['Physical', 'Organic', 'Inorganic'],
        Mathematics: ['Algebra', 'Calculus', 'Geometry']
      },
      totalMarks: 300,
      totalQuestions: 75,
      durationMinutes: 180
    }
  });
  
  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@edutech.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      name: 'Admin User',
      role: 'SUPER_ADMIN'
    }
  });
}
```

---

## Constraints & Triggers

### Soft Delete Constraint
```sql
-- Ensure deleted users cannot login
ALTER TABLE users ADD CONSTRAINT deleted_users_no_login
  CHECK (deleted_at IS NULL OR last_login_at < deleted_at);
```

### Subscription Tests Remaining
```sql
-- Bundle subscriptions must have tests_remaining
ALTER TABLE subscriptions ADD CONSTRAINT bundle_has_tests
  CHECK (
    (tier IN ('BUNDLE_10', 'BUNDLE_25', 'BUNDLE_50') AND tests_remaining IS NOT NULL)
    OR tier NOT IN ('BUNDLE_10', 'BUNDLE_25', 'BUNDLE_50')
  );
```

### Auto-update Grace Period
```typescript
// Prisma middleware
prisma.$use(async (params, next) => {
  if (params.model === 'Subscription' && params.action === 'create') {
    if (params.args.data.validUntil) {
      params.args.data.graceExpiresAt = new Date(
        params.args.data.validUntil.getTime() + 7 * 24 * 60 * 60 * 1000
      );
    }
  }
  return next(params);
});
```

---

## Performance Optimization

### Connection Pooling
```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Query Optimization
```typescript
// Bad: N+1 query
const attempts = await prisma.testAttempt.findMany();
for (const attempt of attempts) {
  const user = await prisma.user.findUnique({ where: { id: attempt.userId } });
}

// Good: Include relation
const attempts = await prisma.testAttempt.findMany({
  include: { user: true, mockTest: { include: { questions: true } } }
});
```

### Caching Strategy
```typescript
// Redis cache for frequently accessed data
async function getCachedMockTest(id: string) {
  const cached = await redis.get(`mock_test:${id}`);
  if (cached) return JSON.parse(cached);
  
  const mockTest = await prisma.mockTest.findUnique({
    where: { id },
    include: { questions: true }
  });
  
  await redis.set(`mock_test:${id}`, JSON.stringify(mockTest), 'EX', 3600); // 1 hour TTL
  return mockTest;
}
```

---

## Data Retention Policy

| Entity | Retention Period | Archive Strategy |
|--------|------------------|------------------|
| User (deleted) | 90 days | Soft delete, hard delete after 90 days |
| TestAttempt | Lifetime | None (core analytics data) |
| Transaction | 7 years | Move to cold storage after 3 years (tax compliance) |
| WeakArea | Lifetime | None (learning history) |
| Question | Lifetime | None (content library) |
| MockTest (inactive) | 1 year | Archive to Blob Storage, delete from DB |

---

## Next Steps

1. ✅ Generate API contracts (`/contracts/*.yaml`)
2. ✅ Create quickstart guide (`quickstart.md`)
3. ⏭️ Update agent context
