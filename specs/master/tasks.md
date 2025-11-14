# Tasks: EduTech Platform

**Input**: Design documents from `/specs/master/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in these tasks as not explicitly requested in specification

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create multi-service directory structure per plan.md (backend/, frontend/, mobile/, ai-service/, infrastructure/)
- [ ] T002 [P] Initialize backend Node.js project with package.json in backend/
- [ ] T003 [P] Initialize frontend Next.js 15 project with package.json in frontend/
- [ ] T004 [P] Initialize mobile React Native Expo project with package.json in mobile/
- [ ] T005 [P] Initialize ai-service Python project with requirements.txt in ai-service/
- [ ] T006 [P] Configure TypeScript (tsconfig.json) in backend/ and frontend/
- [ ] T007 [P] Configure ESLint and Prettier in backend/, frontend/, mobile/
- [ ] T008 [P] Configure Python linting (flake8, black) in ai-service/
- [ ] T009 [P] Create .env.example files for all services
- [ ] T010 [P] Setup Docker Compose in infrastructure/docker-compose.yml for local dev (PostgreSQL, Redis)
- [ ] T011 [P] Create Dockerfile for backend/ service
- [ ] T012 [P] Create Dockerfile for frontend/ service
- [ ] T013 [P] Create Dockerfile for ai-service/ service
- [ ] T014 [P] Setup Git hooks (pre-commit, pre-push) in .git/hooks/
- [ ] T015 [P] Create GitHub Actions CI workflow in .github/workflows/ci.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM

- [ ] T016 Initialize Prisma in backend/prisma/schema.prisma with base configuration
- [ ] T017 [P] Create User enum types (UserRole, ExamType) in backend/prisma/schema.prisma
- [ ] T018 [P] Create Question enum types (Difficulty, QuestionType) in backend/prisma/schema.prisma
- [ ] T019 [P] Create Subscription enum types (SubscriptionTier, SubscriptionStatus) in backend/prisma/schema.prisma
- [ ] T020 [P] Create TestAttempt enum types (AttemptStatus, SyncStatus) in backend/prisma/schema.prisma
- [ ] T021 [P] Create Transaction enum type (TransactionStatus) in backend/prisma/schema.prisma
- [ ] T022 Run initial Prisma migration in backend/ to create database schema
- [ ] T023 Create database seed script in backend/prisma/seed.ts with sample exams and admin user

### Backend Core Infrastructure

- [ ] T024 Setup Express.js app in backend/src/app.ts with middleware (cors, helmet, compression)
- [ ] T025 [P] Create error handling middleware in backend/src/middleware/errorHandler.ts
- [ ] T026 [P] Create request logging middleware in backend/src/middleware/logger.ts
- [ ] T027 [P] Create rate limiting middleware in backend/src/middleware/rateLimiter.ts
- [ ] T028 [P] Create CORS configuration in backend/src/config/cors.ts
- [ ] T029 [P] Create environment config loader in backend/src/config/env.ts
- [ ] T030 [P] Setup Prisma client singleton in backend/src/lib/prisma.ts
- [ ] T031 [P] Setup Redis client singleton in backend/src/lib/redis.ts
- [ ] T032 [P] Create JWT utility functions in backend/src/lib/jwt.ts
- [ ] T033 [P] Create password hashing utilities in backend/src/lib/password.ts
- [ ] T034 Create authentication middleware in backend/src/middleware/auth.ts (depends on T032)
- [ ] T035 [P] Create validation middleware factory in backend/src/middleware/validate.ts
- [ ] T036 [P] Setup API router structure in backend/src/routes/index.ts
- [ ] T037 [P] Create health check endpoint in backend/src/routes/health.ts
- [ ] T038 [P] Setup Swagger/OpenAPI documentation in backend/src/config/swagger.ts

### Frontend Core Infrastructure

- [ ] T039 Setup Next.js App Router structure in frontend/src/app/
- [ ] T040 [P] Configure Tailwind CSS in frontend/tailwind.config.ts
- [ ] T041 [P] Create global styles in frontend/src/app/globals.css
- [ ] T042 [P] Setup Zustand store structure in frontend/src/store/index.ts
- [ ] T043 [P] Create API client with axios in frontend/src/lib/api.ts
- [ ] T044 [P] Create auth context provider in frontend/src/contexts/AuthContext.tsx
- [ ] T045 [P] Create base UI components (Button, Input, Card) in frontend/src/components/ui/
- [ ] T046 [P] Create loading skeleton components in frontend/src/components/ui/Skeleton.tsx
- [ ] T047 [P] Create toast notification system in frontend/src/components/ui/Toast.tsx
- [ ] T048 [P] Create layout components in frontend/src/components/layout/

### Mobile Core Infrastructure

- [ ] T049 Setup React Navigation in mobile/src/navigation/AppNavigator.tsx
- [ ] T050 [P] Configure React Native Paper theme in mobile/src/theme/index.ts
- [ ] T051 [P] Setup Watermelon DB schema in mobile/src/db/schema.ts
- [ ] T052 [P] Create Watermelon DB models structure in mobile/src/db/models/
- [ ] T053 [P] Setup API client with axios in mobile/src/services/api.ts
- [ ] T054 [P] Create auth service in mobile/src/services/auth.ts
- [ ] T055 [P] Create offline sync service in mobile/src/services/sync.ts
- [ ] T056 [P] Create base UI components in mobile/src/components/ui/
- [ ] T057 [P] Setup navigation types in mobile/src/navigation/types.ts

### AI Service Core Infrastructure

- [ ] T058 Setup FastAPI app in ai-service/src/main.py
- [ ] T059 [P] Configure Azure OpenAI client in ai-service/src/lib/openai_client.py
- [ ] T060 [P] Create Pydantic models in ai-service/src/models/
- [ ] T061 [P] Create database connection utility in ai-service/src/lib/database.py
- [ ] T062 [P] Setup logging configuration in ai-service/src/config/logging.py
- [ ] T063 [P] Create health check endpoint in ai-service/src/api/health.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: Previous Years Database & AI Engine (Priority: P0 - Foundation for AI)

**Goal**: Build the core innovation - scrape previous years papers, analyze patterns, and generate realistic AI questions

**Independent Test**: Scrape 100+ previous year questions, verify storage, run pattern analysis, generate 10 AI questions using historical context, verify <90% similarity to originals

### Previous Years Question Database

- [ ] T064 [P] Create PreviousYearQuestion Prisma model in backend/prisma/schema.prisma
- [ ] T065 Run Prisma migration to add previous_year_questions table in backend/
- [ ] T066 [P] Create PreviousYearQuestion service in backend/src/services/previousYearQuestion.service.ts
- [ ] T067 [P] Create scraping service in ai-service/src/services/scraper.py with pdfplumber integration
- [ ] T068 [P] Create question parser in ai-service/src/services/parser.py for extracting questions from PDF text
- [ ] T069 [P] Create image extraction service in ai-service/src/services/image_extractor.py for diagrams
- [ ] T070 [P] Create pattern analysis service in ai-service/src/services/pattern_analyzer.py
- [ ] T071 Create scraping API endpoint POST /api/scrape in ai-service/src/api/scrape.py
- [ ] T072 [P] Create CLI script for batch scraping in ai-service/scripts/batch_scrape.py
- [ ] T073 [P] Create verification queue UI component in frontend/src/components/admin/VerificationQueue.tsx
- [ ] T074 Create verification API endpoint PUT /api/admin/verify-question/:id in backend/src/routes/admin/questions.ts
- [ ] T075 [P] Create frequency calculation job in ai-service/src/jobs/calculate_frequency.py
- [ ] T076 [P] Create topic tagging service in ai-service/src/services/topic_tagger.py

### AI Question Generation Engine

- [ ] T077 [P] Create AI prompt builder service in ai-service/src/services/prompt_builder.py
- [ ] T078 [P] Create question similarity checker in ai-service/src/services/similarity_checker.py (using embeddings)
- [ ] T079 [P] Create question validator in ai-service/src/services/question_validator.py
- [ ] T080 Create question generation service in ai-service/src/services/question_generator.py (uses T077, T078, T079)
- [ ] T081 Create batch generation Azure Function in ai-service/src/functions/nightly_generation.py
- [ ] T082 [P] Create AI usage tracking in backend/src/services/aiUsageTracking.service.ts
- [ ] T083 Create generation API endpoint POST /api/generate in ai-service/src/api/generate.py
- [ ] T084 [P] Create SME review queue UI in frontend/src/components/admin/SMEReview.tsx
- [ ] T085 Create SME approval API endpoint PUT /api/admin/approve-question/:id in backend/src/routes/admin/questions.ts
- [ ] T086 [P] Create generation monitoring dashboard in frontend/src/app/(admin)/ai-generation/page.tsx
- [ ] T087 [P] Setup Azure Function deployment configuration in infrastructure/terraform/functions.tf

**Checkpoint**: Previous years database populated with 1000+ questions, AI generation producing realistic questions with <90% similarity

---

## Phase 4: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Students can create accounts, log in securely, with DPDP Act compliance (parental consent for minors)

**Independent Test**: Register adult user, verify email, login. Register minor, verify parent email required, parent approves, login. Password reset flow. Session management across devices.

### Backend - User Entity & Auth

- [ ] T088 [P] [US1] Create User Prisma model in backend/prisma/schema.prisma (already in foundational, verify complete)
- [ ] T089 [P] [US1] Create Subscription Prisma model in backend/prisma/schema.prisma
- [ ] T090 Run Prisma migration for User and Subscription tables in backend/
- [ ] T091 [P] [US1] Create User service in backend/src/services/user.service.ts
- [ ] T092 [P] [US1] Create Auth service in backend/src/services/auth.service.ts
- [ ] T093 [P] [US1] Create Email service in backend/src/services/email.service.ts
- [ ] T094 [P] [US1] Create SMS service (optional) in backend/src/services/sms.service.ts
- [ ] T095 [P] [US1] Create Subscription service in backend/src/services/subscription.service.ts
- [ ] T096 [US1] Create POST /auth/register endpoint in backend/src/routes/auth.ts (depends on T091-T095)
- [ ] T097 [US1] Create POST /auth/login endpoint in backend/src/routes/auth.ts
- [ ] T098 [US1] Create POST /auth/logout endpoint in backend/src/routes/auth.ts
- [ ] T099 [US1] Create POST /auth/password/reset endpoint in backend/src/routes/auth.ts
- [ ] T100 [US1] Create POST /auth/password/reset/confirm endpoint in backend/src/routes/auth.ts
- [ ] T101 [US1] Create PUT /auth/consent endpoint in backend/src/routes/auth.ts
- [ ] T102 [US1] Create GET /auth/me endpoint for current user in backend/src/routes/auth.ts
- [ ] T103 [P] [US1] Create parental consent email template in backend/src/templates/email/parental-consent.html
- [ ] T104 [P] [US1] Create email verification template in backend/src/templates/email/verify-email.html
- [ ] T105 [P] [US1] Create password reset email template in backend/src/templates/email/password-reset.html

### Frontend - Auth Pages & UI

- [ ] T106 [P] [US1] Create register page in frontend/src/app/(auth)/register/page.tsx
- [ ] T107 [P] [US1] Create login page in frontend/src/app/(auth)/login/page.tsx
- [ ] T108 [P] [US1] Create password reset request page in frontend/src/app/(auth)/forgot-password/page.tsx
- [ ] T109 [P] [US1] Create password reset confirm page in frontend/src/app/(auth)/reset-password/page.tsx
- [ ] T110 [P] [US1] Create email verification page in frontend/src/app/(auth)/verify-email/page.tsx
- [ ] T111 [P] [US1] Create parental consent page in frontend/src/app/(auth)/parental-consent/page.tsx
- [ ] T112 [P] [US1] Create auth form components in frontend/src/components/auth/
- [ ] T113 [P] [US1] Create age verification component in frontend/src/components/auth/AgeVerification.tsx
- [ ] T114 [P] [US1] Create password strength indicator in frontend/src/components/auth/PasswordStrength.tsx
- [ ] T115 [US1] Implement auth store actions in frontend/src/store/authSlice.ts
- [ ] T116 [P] [US1] Create OAuth integration (Google) in frontend/src/lib/oauth.ts
- [ ] T117 [P] [US1] Create session management utility in frontend/src/lib/session.ts

### Mobile - Auth Screens

- [ ] T118 [P] [US1] Create RegisterScreen in mobile/src/screens/Auth/RegisterScreen.tsx
- [ ] T119 [P] [US1] Create LoginScreen in mobile/src/screens/Auth/LoginScreen.tsx
- [ ] T120 [P] [US1] Create ForgotPasswordScreen in mobile/src/screens/Auth/ForgotPasswordScreen.tsx
- [ ] T121 [P] [US1] Create EmailVerificationScreen in mobile/src/screens/Auth/EmailVerificationScreen.tsx
- [ ] T122 [P] [US1] Create auth navigation flow in mobile/src/navigation/AuthNavigator.tsx
- [ ] T123 [P] [US1] Create User Watermelon DB model in mobile/src/db/models/User.ts
- [ ] T124 [US1] Update auth service with API calls in mobile/src/services/auth.ts
- [ ] T125 [P] [US1] Create secure storage utility in mobile/src/lib/secureStorage.ts for JWT tokens

**Checkpoint**: Users can register (adult/minor), verify email, login, reset password, manage sessions independently

---

## Phase 5: Exam & Question Management (Priority: P1.5 - Required for Tests)

**Goal**: Admin can manage exam types, syllabus, and content administrators can verify questions

**Independent Test**: Create IIT-JEE exam with syllabus, verify scraped question, approve AI-generated question

### Backend - Exam & Question Models

- [ ] T126 [P] Create Exam Prisma model in backend/prisma/schema.prisma
- [ ] T127 [P] Create MockTest Prisma model in backend/prisma/schema.prisma
- [ ] T128 [P] Create Question Prisma model in backend/prisma/schema.prisma
- [ ] T129 Run Prisma migration for Exam, MockTest, Question tables in backend/
- [ ] T130 [P] Create Exam service in backend/src/services/exam.service.ts
- [ ] T131 [P] Create MockTest service in backend/src/services/mockTest.service.ts
- [ ] T132 [P] Create Question service in backend/src/services/question.service.ts
- [ ] T133 Create GET /api/exams endpoint in backend/src/routes/exams.ts
- [ ] T134 Create POST /api/admin/exams endpoint in backend/src/routes/admin/exams.ts
- [ ] T135 Create PUT /api/admin/exams/:id endpoint in backend/src/routes/admin/exams.ts
- [ ] T136 [P] Create admin authorization middleware in backend/src/middleware/adminAuth.ts

### Frontend - Admin Pages

- [ ] T137 [P] Create exam management page in frontend/src/app/(admin)/exams/page.tsx
- [ ] T138 [P] Create exam form component in frontend/src/components/admin/ExamForm.tsx
- [ ] T139 [P] Create syllabus editor component in frontend/src/components/admin/SyllabusEditor.tsx

**Checkpoint**: Exams can be created and managed, questions verified by content team

---

## Phase 6: User Story 2 - AI Mock Test Taking Experience (Priority: P2) 🎯

**Goal**: Students can browse available tests, start a test, answer questions, and submit with real-time sync across devices

**Independent Test**: Login, browse tests filtered by exam type, start test (subscription check), answer questions, see real-time sync on another device, submit test, receive immediate score

### Backend - Test Attempt & Sync

- [ ] T140 [P] [US2] Create TestAttempt Prisma model in backend/prisma/schema.prisma
- [ ] T141 Run Prisma migration for TestAttempt table in backend/
- [ ] T142 [P] [US2] Create TestAttempt service in backend/src/services/testAttempt.service.ts
- [ ] T143 [P] [US2] Create Scoring service in backend/src/services/scoring.service.ts
- [ ] T144 [P] [US2] Create WebSocket server for real-time sync in backend/src/lib/websocket.ts
- [ ] T145 [P] [US2] Create subscription check middleware in backend/src/middleware/subscriptionCheck.ts
- [ ] T146 [US2] Create GET /api/tests endpoint in backend/src/routes/tests.ts (list available tests)
- [ ] T147 [US2] Create GET /api/tests/:id endpoint in backend/src/routes/tests.ts (test details)
- [ ] T148 [US2] Create POST /api/tests/:id/start endpoint in backend/src/routes/tests.ts (start test)
- [ ] T149 [US2] Create GET /api/tests/attempts/:id endpoint in backend/src/routes/tests.ts (attempt status)
- [ ] T150 [US2] Create PUT /api/tests/attempts/:id/responses endpoint in backend/src/routes/tests.ts (save answer)
- [ ] T151 [US2] Create POST /api/tests/attempts/:id/submit endpoint in backend/src/routes/tests.ts (submit test)
- [ ] T152 [US2] Create GET /api/tests/attempts/:id/results endpoint in backend/src/routes/tests.ts (get results)
- [ ] T153 [P] [US2] Create timer service with server-authoritative time in backend/src/services/timer.service.ts
- [ ] T154 [P] [US2] Create conflict resolution service in backend/src/services/conflictResolution.service.ts

### Frontend - Test Taking UI

- [ ] T155 [P] [US2] Create test list page in frontend/src/app/(dashboard)/tests/page.tsx
- [ ] T156 [P] [US2] Create test detail page in frontend/src/app/(dashboard)/tests/[id]/page.tsx
- [ ] T157 [P] [US2] Create test taking page in frontend/src/app/test/[attemptId]/page.tsx
- [ ] T158 [P] [US2] Create question display component in frontend/src/components/test/QuestionCard.tsx
- [ ] T159 [P] [US2] Create option selector component in frontend/src/components/test/OptionSelector.tsx
- [ ] T160 [P] [US2] Create test timer component in frontend/src/components/test/TestTimer.tsx
- [ ] T161 [P] [US2] Create question palette component in frontend/src/components/test/QuestionPalette.tsx
- [ ] T162 [P] [US2] Create test navigation component in frontend/src/components/test/TestNavigation.tsx
- [ ] T163 [P] [US2] Create sync status indicator in frontend/src/components/test/SyncStatus.tsx
- [ ] T164 [US2] Create WebSocket client hook in frontend/src/hooks/useWebSocket.ts
- [ ] T165 [US2] Create test store with real-time sync in frontend/src/store/testSlice.ts
- [ ] T166 [P] [US2] Create auto-save utility in frontend/src/lib/autoSave.ts (every 30 seconds)
- [ ] T167 [P] [US2] Create test submission modal in frontend/src/components/test/SubmitModal.tsx

### Mobile - Test Taking Screens

- [ ] T168 [P] [US2] Create TestListScreen in mobile/src/screens/Test/TestListScreen.tsx
- [ ] T169 [P] [US2] Create TestDetailScreen in mobile/src/screens/Test/TestDetailScreen.tsx
- [ ] T170 [P] [US2] Create TestTakingScreen in mobile/src/screens/Test/TestTakingScreen.tsx
- [ ] T171 [P] [US2] Create TestAttempt Watermelon DB model in mobile/src/db/models/TestAttempt.ts
- [ ] T172 [P] [US2] Create Question Watermelon DB model in mobile/src/db/models/Question.ts
- [ ] T173 [P] [US2] Create offline test service in mobile/src/services/offlineTest.ts
- [ ] T174 [US2] Create sync service for test responses in mobile/src/services/sync.ts
- [ ] T175 [P] [US2] Create question rendering component in mobile/src/components/test/QuestionCard.tsx
- [ ] T176 [P] [US2] Create timer component in mobile/src/components/test/Timer.tsx
- [ ] T177 [P] [US2] Create test navigation in mobile/src/navigation/TestNavigator.tsx

**Checkpoint**: Students can take full tests with real-time sync, offline support (mobile), and automatic scoring

---

## Phase 7: User Story 3 - Test Results & Analytics (Priority: P3) 🎯

**Goal**: Students see detailed results with score, percentile, weak areas, and performance trends

**Independent Test**: Submit test, view results page with score breakdown, see correct/incorrect answers with explanations, view weak areas (topics <60% accuracy), check progress over time

### Backend - Analytics & Weak Areas

- [ ] T178 [P] [US3] Create WeakArea Prisma model in backend/prisma/schema.prisma
- [ ] T179 Run Prisma migration for WeakArea table in backend/
- [ ] T180 [P] [US3] Create WeakArea service in backend/src/services/weakArea.service.ts
- [ ] T181 [P] [US3] Create Analytics service in backend/src/services/analytics.service.ts
- [ ] T182 [P] [US3] Create Percentile calculation service in backend/src/services/percentile.service.ts
- [ ] T183 [US3] Create GET /api/analytics/weak-areas endpoint in backend/src/routes/analytics.ts
- [ ] T184 [US3] Create GET /api/analytics/progress endpoint in backend/src/routes/analytics.ts
- [ ] T185 [US3] Create GET /api/analytics/percentile endpoint in backend/src/routes/analytics.ts
- [ ] T186 [P] [US3] Create background job for weak area calculation in backend/src/jobs/calculateWeakAreas.ts
- [ ] T187 [P] [US3] Create background job for percentile calculation in backend/src/jobs/calculatePercentiles.ts

### Frontend - Results & Analytics UI

- [ ] T188 [P] [US3] Create results page in frontend/src/app/results/[attemptId]/page.tsx
- [ ] T189 [P] [US3] Create score summary component in frontend/src/components/results/ScoreSummary.tsx
- [ ] T190 [P] [US3] Create answer review component in frontend/src/components/results/AnswerReview.tsx
- [ ] T191 [P] [US3] Create weak areas component in frontend/src/components/analytics/WeakAreas.tsx
- [ ] T192 [P] [US3] Create progress chart component in frontend/src/components/analytics/ProgressChart.tsx (using Recharts)
- [ ] T193 [P] [US3] Create percentile visualization in frontend/src/components/analytics/PercentileChart.tsx
- [ ] T194 [P] [US3] Create analytics dashboard page in frontend/src/app/(dashboard)/analytics/page.tsx
- [ ] T195 [P] [US3] Create topic performance breakdown in frontend/src/components/analytics/TopicBreakdown.tsx

### Mobile - Results Screens

- [ ] T196 [P] [US3] Create ResultsScreen in mobile/src/screens/Results/ResultsScreen.tsx
- [ ] T197 [P] [US3] Create AnalyticsScreen in mobile/src/screens/Analytics/AnalyticsScreen.tsx
- [ ] T198 [P] [US3] Create WeakArea Watermelon DB model in mobile/src/db/models/WeakArea.ts
- [ ] T199 [P] [US3] Create analytics charts in mobile/src/components/analytics/Charts.tsx

**Checkpoint**: Students see comprehensive results, understand weak areas, track progress over time

---

## Phase 8: User Story 4 - Subscription & Payment Management (Priority: P4) 🎯

**Goal**: Students can purchase subscription plans (Bundle/Unlimited), make payments via Razorpay, and manage renewals

**Independent Test**: Browse subscription tiers, select Bundle 10 (₹499), complete Razorpay payment, verify subscription activated, attempt test (credit decremented), check grace period on expiry

### Backend - Subscription & Payment

- [ ] T200 [P] [US4] Create Transaction Prisma model in backend/prisma/schema.prisma
- [ ] T201 Run Prisma migration for Transaction table in backend/
- [ ] T202 [P] [US4] Create Payment service with Razorpay integration in backend/src/services/payment.service.ts
- [ ] T203 [P] [US4] Create Razorpay webhook signature verifier in backend/src/lib/razorpay.ts
- [ ] T204 [US4] Create GET /api/subscriptions endpoint in backend/src/routes/subscriptions.ts
- [ ] T205 [US4] Create POST /api/subscriptions endpoint in backend/src/routes/subscriptions.ts (create subscription)
- [ ] T206 [US4] Create GET /api/subscriptions/:id endpoint in backend/src/routes/subscriptions.ts
- [ ] T207 [US4] Create DELETE /api/subscriptions/:id endpoint in backend/src/routes/subscriptions.ts (cancel)
- [ ] T208 [US4] Create POST /api/subscriptions/:id/upgrade endpoint in backend/src/routes/subscriptions.ts
- [ ] T209 [US4] Create POST /api/payments/orders endpoint in backend/src/routes/payments.ts
- [ ] T210 [US4] Create POST /api/payments/verify endpoint in backend/src/routes/payments.ts
- [ ] T211 [US4] Create POST /api/webhooks/razorpay endpoint in backend/src/routes/webhooks.ts
- [ ] T212 [P] [US4] Create grace period check cron job in backend/src/jobs/checkGracePeriod.ts
- [ ] T213 [P] [US4] Create subscription expiry notification email in backend/src/templates/email/subscription-expiry.html

### Frontend - Subscription Pages

- [ ] T214 [P] [US4] Create subscription plans page in frontend/src/app/(dashboard)/subscription/page.tsx
- [ ] T215 [P] [US4] Create pricing cards component in frontend/src/components/subscription/PricingCards.tsx
- [ ] T216 [P] [US4] Create Razorpay checkout integration in frontend/src/lib/razorpay.ts
- [ ] T217 [P] [US4] Create payment success page in frontend/src/app/payment/success/page.tsx
- [ ] T218 [P] [US4] Create payment failure page in frontend/src/app/payment/failure/page.tsx
- [ ] T219 [P] [US4] Create subscription management page in frontend/src/app/(dashboard)/account/subscription/page.tsx
- [ ] T220 [P] [US4] Create upgrade modal component in frontend/src/components/subscription/UpgradeModal.tsx

### Mobile - Subscription Screens

- [ ] T221 [P] [US4] Create SubscriptionScreen in mobile/src/screens/Subscription/SubscriptionScreen.tsx
- [ ] T222 [P] [US4] Create payment integration in mobile/src/services/payment.ts
- [ ] T223 [P] [US4] Create Subscription Watermelon DB model in mobile/src/db/models/Subscription.ts

**Checkpoint**: Payment flow works end-to-end, subscriptions activated, grace period enforced

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Security & Compliance

- [ ] T224 [P] Implement OWASP ASVS Level 2 security headers in backend/src/middleware/security.ts
- [ ] T225 [P] Add CSRF protection in backend/src/middleware/csrf.ts
- [ ] T226 [P] Implement input sanitization in backend/src/middleware/sanitize.ts
- [ ] T227 [P] Create data localization check in backend/src/middleware/dataLocalization.ts
- [ ] T228 [P] Implement encryption at rest for sensitive fields in backend/src/lib/encryption.ts
- [ ] T229 [P] Create DPDP Act compliance documentation in docs/compliance/dpdp-act.md
- [ ] T230 [P] Create privacy policy page in frontend/src/app/privacy/page.tsx
- [ ] T231 [P] Create terms of service page in frontend/src/app/terms/page.tsx

### Monitoring & Observability

- [ ] T232 [P] Setup Prometheus metrics endpoint in backend/src/routes/metrics.ts
- [ ] T233 [P] Create custom metrics for API latency in backend/src/middleware/metrics.ts
- [ ] T234 [P] Create error tracking with structured logging in backend/src/lib/logger.ts
- [ ] T235 [P] Setup Grafana dashboards in infrastructure/monitoring/dashboards/
- [ ] T236 [P] Create PagerDuty alert rules in infrastructure/monitoring/alerts/critical.yml
- [ ] T237 [P] Create Slack alert rules in infrastructure/monitoring/alerts/warnings.yml
- [ ] T238 [P] Create health check monitoring in infrastructure/monitoring/health-check.sh

### Performance Optimization

- [ ] T239 [P] Implement database query optimization (indexes, query plan analysis) in backend/
- [ ] T240 [P] Add Redis caching for frequent queries in backend/src/lib/cache.ts
- [ ] T241 [P] Implement CDN integration for static assets in frontend/next.config.js
- [ ] T242 [P] Add image optimization with WebP in frontend/src/lib/imageOptimizer.ts
- [ ] T243 [P] Implement code splitting in frontend/src/app/
- [ ] T244 [P] Add lazy loading for mobile images in mobile/src/components/LazyImage.tsx

### Infrastructure & Deployment

- [ ] T245 [P] Create Terraform configuration for Azure resources in infrastructure/terraform/main.tf
- [ ] T246 [P] Create Azure PostgreSQL configuration in infrastructure/terraform/database.tf
- [ ] T247 [P] Create Azure Redis configuration in infrastructure/terraform/redis.tf
- [ ] T248 [P] Create Azure Blob Storage configuration in infrastructure/terraform/storage.tf
- [ ] T249 [P] Create Azure OpenAI configuration in infrastructure/terraform/openai.tf
- [ ] T250 [P] Create Azure Key Vault configuration in infrastructure/terraform/keyvault.tf
- [ ] T251 [P] Create GitHub Actions deployment workflow in .github/workflows/deploy-prod.yml
- [ ] T252 [P] Create staging deployment workflow in .github/workflows/deploy-staging.yml
- [ ] T253 [P] Create backup automation script in infrastructure/scripts/backup.sh
- [ ] T254 [P] Create restore testing script in infrastructure/scripts/test-restore.sh

### Documentation

- [ ] T255 [P] Create API documentation with Swagger UI in backend/
- [ ] T256 [P] Update README.md with project overview and setup instructions
- [ ] T257 [P] Create architecture diagrams (C4 model) in docs/architecture/
- [ ] T258 [P] Create ADRs for major decisions in docs/adr/
- [ ] T259 [P] Create developer contribution guide in docs/CONTRIBUTING.md
- [ ] T260 [P] Run quickstart.md validation (verify local setup works)

### Accessibility & UX

- [ ] T261 [P] Implement WCAG 2.1 Level AA compliance in frontend/src/components/
- [ ] T262 [P] Add keyboard navigation support in frontend/
- [ ] T263 [P] Create illustrated empty states in frontend/public/illustrations/
- [ ] T264 [P] Add screen reader support in mobile/src/components/
- [ ] T265 [P] Implement color contrast validation in frontend/tailwind.config.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **Previous Years DB & AI (Phase 3)**: Depends on Foundational - REQUIRED for realistic test generation
- **Exam Management (Phase 5)**: Depends on Foundational + Phase 3 - REQUIRED for tests
- **User Stories (Phase 4, 6, 7, 8)**: All depend on Foundational + Phase 3 + Phase 5
  - Can proceed in parallel after dependencies met
  - Or sequentially in priority order: US1 (Auth) → US2 (Tests) → US3 (Analytics) → US4 (Payments)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### Critical Path

1. **Setup** (T001-T015) → **Foundational** (T016-T063) → **Previous Years DB** (T064-T076) → **AI Engine** (T077-T087) → **Exam Management** (T126-T139)
2. Then User Stories can begin: **US1** (T088-T125) → **US2** (T140-T177) → **US3** (T178-T199) → **US4** (T200-T223)
3. Finally **Polish** (T224-T265)

### User Story Dependencies

- **US1 (Auth)**: Depends on Foundational - No dependencies on other stories
- **US2 (Test Taking)**: Depends on Foundational + Previous Years DB + AI Engine + Exam Management + US1 (need auth)
- **US3 (Analytics)**: Depends on US2 (need test attempts to analyze)
- **US4 (Payments)**: Depends on US1 (need user accounts), integrates with US2 (subscription checks)

### Parallel Opportunities

#### Within Phase 1 (Setup)
All tasks T002-T015 can run in parallel

#### Within Phase 2 (Foundational)
- T017-T021 (Enums) can run in parallel
- T024-T038 (Backend infrastructure) can run in parallel after T023
- T039-T048 (Frontend infrastructure) can run in parallel
- T049-T057 (Mobile infrastructure) can run in parallel
- T058-T063 (AI service infrastructure) can run in parallel

#### Within Phase 3 (Previous Years & AI)
- T066-T076 (Previous years pipeline) can run in parallel after T065
- T077-T079 can run in parallel
- T082-T087 can run in parallel

#### Within User Stories
- Models, services, UI components within each story can be parallelized
- Example US2: T142-T154 (services) parallel, then T155-T167 (frontend) parallel, then T168-T177 (mobile) parallel

---

## Parallel Example: User Story 2 (Test Taking)

```bash
# Backend services (parallel after T141)
T142: TestAttempt service
T143: Scoring service
T144: WebSocket server
T145: Subscription check middleware
T153: Timer service
T154: Conflict resolution service

# Backend endpoints (sequential after services)
T146-T152: API endpoints

# Frontend (parallel)
T155: Test list page
T156: Test detail page
T157: Test taking page
T158-T167: Test components

# Mobile (parallel)
T168-T177: Mobile test screens
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Core Features for MVP**:
1. Phase 1: Setup ✅
2. Phase 2: Foundational ✅
3. Phase 3: Previous Years DB + AI Engine ✅ (Core Innovation!)
4. Phase 5: Exam Management ✅
5. Phase 4 (US1): Authentication ✅
6. Phase 6 (US2): Test Taking ✅

**Stop here for MVP demo** - Students can register, take AI-generated realistic tests, get immediate scores

### Incremental Delivery

1. **Foundation** (Phases 1-3): Setup + Core + AI Engine → AI question generation working
2. **MVP** (+ Phase 4-5-6): Add Auth + Exams + Test Taking → Students can take tests
3. **Analytics** (+ Phase 7): Add US3 → Students see weak areas and progress
4. **Monetization** (+ Phase 8): Add US4 → Payment integration live
5. **Production Ready** (+ Phase 9): Polish → Launch ready

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

1. **Team A**: Phase 3 (Previous Years DB + AI Engine) - 2-3 developers
2. **Team B**: Phase 4 (US1 - Auth) - 1-2 developers
3. **Team C**: Phase 5 (Exam Management) - 1 developer

After Phase 3, 4, 5 complete:
- **Team A**: Phase 6 (US2 - Test Taking)
- **Team B**: Phase 7 (US3 - Analytics)
- **Team C**: Phase 8 (US4 - Payments)

---

## Task Summary

**Total Tasks**: 265
- Phase 1 (Setup): 15 tasks
- Phase 2 (Foundational): 48 tasks (CRITICAL - blocks all stories)
- Phase 3 (Previous Years DB + AI Engine): 24 tasks (CORE INNOVATION)
- Phase 5 (Exam Management): 14 tasks
- Phase 4 (US1 - Auth): 38 tasks
- Phase 6 (US2 - Test Taking): 38 tasks
- Phase 7 (US3 - Analytics): 22 tasks
- Phase 8 (US4 - Payments): 24 tasks
- Phase 9 (Polish): 42 tasks

**Parallel Opportunities**: 150+ tasks marked [P] can run in parallel within their phase

**MVP Scope**: Tasks T001-T177 (177 tasks) = Fully functional test-taking platform with AI-generated questions

**Independent Test Criteria**:
- ✅ **Previous Years DB**: 1000+ verified questions stored, pattern analysis complete
- ✅ **AI Generation**: 100+ AI questions generated with <90% similarity to originals
- ✅ **US1 (Auth)**: Create account (adult/minor), verify email/parent consent, login
- ✅ **US2 (Tests)**: Browse tests, start test, answer questions, sync across devices, submit, get score
- ✅ **US3 (Analytics)**: View results, see weak areas, track progress
- ✅ **US4 (Payments)**: Purchase subscription, make payment, access tests

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Core Innovation Emphasis**: Phase 3 (Previous Years DB + AI Engine) is the differentiator
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Database migrations should be tested in staging before production
- All secrets in Azure Key Vault, never in code
- DPDP Act compliance required from day one
