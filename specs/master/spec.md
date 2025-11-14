# Functional Specification: EduTech

## Project Overview
EduTech is a subscription-based platform providing AI-powered mock tests for competitive exams in India. Starting with IIT-JEE and NEET, the platform analyzes past papers and generates realistic mock tests while providing personalized improvement recommendations.

## Clarifications

### Session 2025-11-14
- Q: What level of offline support is required for the mobile test-taking experience? → A: Online-only with reconnection handling (retry on network drops)
- Q: Which payment gateway integration approach should be used for Indian payment methods? → A: Razorpay or Cashfree with tokenization
- Q: What are the specific pricing tiers and test allocations for subscription plans? → A: Free: 1 test, Bundle: 10/25/50 tests (₹499/999/1699), Unlimited: ₹799-11,999/month-year
- Q: What mobile development approach should be used for iOS and Android apps? → A: React Native (cross-platform)
- Q: What is the acceptable level of question repetition across tests for the same user? → A: Maximum 10% repetition within 30-day period
- Q: What visual approach should be used for loading and error states? → A: Skeleton screens for loading, toast notifications for errors, illustrated empty states
- Q: How should payment failures and subscription expiry be handled? → A: 7-day grace period with retry, email notifications, limited access during grace
- Q: What are the alerting thresholds and escalation rules for performance monitoring? → A: Critical alerts (downtime, p95 >500ms) to PagerDuty, warnings (p95 >300ms, errors >1%) to Slack
- Q: How should the system handle concurrent test access from multiple devices? → A: Sync state in real-time across all devices with operational transforms
- Q: How should the test timer be synchronized across multiple devices to prevent cheating? → A: Server-authoritative time with client-side countdown, validate elapsed time on submission

## Core User Personas

### Student (Primary User)
- Age: 16-19 years
- Goal: Prepare effectively for competitive exams with limited time
- Needs: Realistic practice, personalized feedback, focused improvement areas
- Pain Points: Overwhelming syllabus, unclear weak areas, generic study materials

### Content Administrator
- Role: Manages exam types, question banks, and syllabus updates
- Needs: Easy content management, quality control tools
- Access: Admin dashboard

## User Stories & Acceptance Criteria

### US-1: User Registration & Authentication (Priority: P1)
**As a** student  
**I want to** create an account and log in securely  
**So that** I can access my personalized test history and progress

**Why this priority**: P1 - Foundation for all user-specific features; must be secure and compliant from day one.

**Independent Test**: Can be fully tested by creating accounts (adult and minor), verifying email/parent consent, logging in/out, and password reset. Delivers standalone value as authentication gate for all features.

**Acceptance Scenarios**:

1. **Given** I am a new user over 18 years old
   **When** I register with valid email and password
   **Then** I receive a verification email
   **And** I can verify my account and log in successfully
   **And** my data is stored in India-based infrastructure

2. **Given** I am a student under 18 years old
   **When** I attempt to register
   **Then** I am prompted to provide parent/guardian email
   **And** parent receives consent verification email
   **And** I cannot access the platform until parent approves
   **And** parent consent is recorded with timestamp

3. **Given** I have a verified account
   **When** I forget my password and request reset
   **Then** I receive a secure reset link via email
   **And** I can set a new password
   **And** old sessions are invalidated

4. **Given** I am logged in on one device
   **When** I log in from a different device
   **Then** both sessions remain active
   **And** I can manage/revoke sessions from account settings

**Acceptance Criteria:**
- Users can register with email/phone and password
- Users under 18 MUST provide verifiable parental consent during registration
- Parental consent verification: Email/phone verification with explicit consent click-through
- Social login options (Google, Apple) with open-source OAuth implementation
- Email/SMS verification required
- Password reset functionality
- Session management across devices
- All user data stored in India-based infrastructure
- Transparent privacy policy in English and Hindi
- User rights: Access, correction, deletion of personal data
- Loading states: Skeleton screens showing content structure
- Error states: Toast notifications for transient errors, inline messages for form validation
- Empty states: Illustrated graphics with actionable call-to-action buttons

## Functional Requirements

### FR-1: AI Mock Test Engine with Previous Years Paper Analysis

**Core Innovation**: Generate realistic exam questions by studying historical patterns from 10+ years of previous papers

#### Previous Years Paper Database
- **Data Collection**:
  - Scrape/collect 10+ years of official exam papers (IIT-JEE Main/Advanced, NEET)
  - Store minimum 5,000 historical questions per exam type
  - Include: Question text, options, correct answer, official explanation, year, pattern
- **Database Schema**:
  - `PreviousYearQuestion` entity with fields:
    - examType (IIT_JEE, NEET), year, section, questionNumber
    - topic, subtopic, difficulty, bloomLevel, conceptsTested
    - questionType (MCQ, numerical, assertion-reason, integer)
    - weightage, marks, negativeMarks
    - frequency (how often this concept appears)
    - imageUrl (for diagrams/graphs)
    - officialSolution, commonMistakes
- **Pattern Analysis Pipeline**:
  - Topic distribution analysis: Which topics appear most frequently
  - Difficulty progression: How difficulty varies across sections
  - Question phrasing patterns: Common sentence structures and styles
  - Concept combinations: Which concepts are tested together
  - Trending topics: Increasing/decreasing frequency over years
  - Weightage calculation: Topic-wise marks distribution

#### AI Question Generation
- **Azure OpenAI Service (GPT-5)**:
  - Deployment in Central India region for data localization
  - Context window includes: 5-10 similar previous year questions + topic syllabus + exam pattern
  - Prompt engineering: "Generate a question on [topic] similar in style and difficulty to these previous year questions: [examples]"
  - Request structured output: question, 4 options, correct answer, detailed explanation, difficulty justification
- **Quality Validation**:
  - Similarity check: Ensure <90% similarity to any existing question (prevent duplicates)
  - Topic alignment: Verify generated question matches syllabus and exam pattern
  - Difficulty calibration: Compare with historical questions of same topic
  - Explanation quality: Must include step-by-step solution, common mistakes, key concepts
- **Generation Strategy**:
  - Nightly batch generation (11 PM IST) to populate test pool
  - Generate 100 new tests per exam type per week
  - Topic distribution matches last 3 years' exam patterns
  - Difficulty: 40% easy, 40% medium, 20% hard (adjustable per exam)
- **SME Review Workflow**:
  - AI-generated questions flagged as "Pending Review"
  - 2 subject matter experts review complex/multi-concept questions
  - Approval required before question enters production test pool
  - Rejection feedback improves AI prompts
- **Uniqueness & Repetition Control**:
  - Questions are unique per test with maximum 10% repetition within 30-day period per user
  - Track user's question history to avoid repetition
  - Prioritize questions user hasn't seen before
- **Fallback Mechanism**:
  - Maintain minimum 1000 pre-verified questions per exam type
  - If AI service unavailable, fall back to verified question pool
  - Alert monitoring team if fallback activated

### FR-2: Answer Evaluation System
- Automatic grading for objective questions
- Apply official marking scheme (positive/negative marking)
- Store user responses for historical analysis

### FR-3: Analytics & Insights Engine
- Calculate topic-wise accuracy
- Identify weak areas using ML algorithms
- Generate personalized study recommendations
- Track performance trends over time
- Compare with peer performance (anonymized)
- Percentile calculation when minimum 50 users have taken same test

### FR-4: Payment & Subscription Management
- Process payments via Razorpay or Cashfree with tokenization (PCI DSS SAQ A compliant)
- Support UPI, credit/debit cards, net banking, wallets
- Handle payment failures with automatic retry (3 attempts over 24 hours)
- 7-day grace period on payment failure: users can review past tests but cannot start new tests
- Email notifications: payment failure alert (immediate), reminder at day 3, final notice at day 6
- Auto-renewal for unlimited plans with 7-day advance notification
- Subscription status tracking: Active, Expired, Cancelled, Grace Period
- Refund policy: Full refund within 7 days if zero tests attempted, no refund after any test taken

### FR-5: Real-time Test Synchronization
- Allow concurrent access to same test from multiple devices
- Real-time state synchronization across all active sessions
- Operational transformation for conflict-free concurrent edits
- WebSocket or Server-Sent Events for bi-directional sync
- Auto-save responses every 30 seconds across all devices
- Visual indicator showing sync status (synced, syncing, conflict resolved)
- Last updated timestamp visible on all devices
- Graceful handling of network disconnections with automatic reconnection
- **Timer Security**: Server-authoritative time management
  - Server provides authoritative start timestamp when test begins
  - Client runs countdown locally for smooth UX
  - Timer synced across all active devices via real-time updates
  - Server validates total elapsed time at submission
  - Reject submission if time manipulation detected (elapsed time exceeds allowed duration)
  - Auto-submit when server-side timer expires

## Key Entities

### PreviousYearQuestion
- Exam type: IIT-JEE Main, IIT-JEE Advanced, NEET
- Year and exam session
- Section, question number
- Question text, images, formulas
- Options (for MCQ) or answer format (for numerical)
- Correct answer(s)
- Official solution and explanation
- Topic tags: Subject, topic, subtopic
- Metadata: Difficulty level, bloom taxonomy level, concepts tested
- Question type: MCQ, numerical, assertion-reason, integer-type, multi-correct
- Weightage: Marks, negative marking scheme
- Frequency analysis: How many times this concept tested in last N years
- Common mistakes and misconceptions
- Related learning resources
- Scrape source: Official paper PDF, website URL
- Verification status: Verified by content team, approved by SME
- Usage in AI generation: Number of times used as reference for AI prompts

### User
- Basic info: Name, email, phone, date of birth
- Role: Student, Admin, Content Manager
- Age verification status (for DPDP compliance)
- Parent/guardian info (for minors)
- Preferences: Language, notification settings
- Subscription status and history

### Exam
- Name: IIT-JEE, NEET, etc.
- Pattern: Structure, sections, question types
- Syllabus: Subjects, topics, weightage
- Timing: Total duration, section-wise timing
- Marking scheme: Positive/negative marks

### Question
- Text content, images, formulas
- Options (for MCQ)
- Correct answer(s)
- Explanation and solution steps
- Metadata: Topic tags, difficulty level, exam type, year
- Related learning resources

### MockTest
- Associated exam type
- Generated questions
- User assignment
- Status: Not started, In progress, Completed
- Start time, end time, duration

### TestAttempt
- User reference
- Mock test reference
- User responses for each question
- Time spent per question
- Total score and section-wise breakdown
- Server-authoritative start timestamp (UTC)
- Server-authoritative end timestamp (UTC)
- Total elapsed time (calculated server-side)
- Active device sessions (array of device IDs currently accessing test)
- Last sync timestamp per device
- Conflict resolution log (if any concurrent edits occurred)
- Submission validation status (time check passed/failed)

### Subscription
- User reference
- Plan type: Free (1 test lifetime), Bundle (10 tests ₹499, 25 tests ₹999, 50 tests ₹1699, 6 months validity), Unlimited (Single exam ₹799/month or ₹7999/year, All exams ₹1199/month or ₹11,999/year)
- Start date, end date
- Status: Active, Expired, Cancelled, Grace period (7 days)
- Payment history with retry attempts
- Remaining test credits (for bundles)
- Grace period start date and expiry date
- Notification history (payment failure alerts sent)

## Success Criteria

### User Engagement & Satisfaction
- 90% of users successfully complete their first mock test without technical issues
- Users can start a test within 30 seconds of clicking "Begin Test"
- Average continuous session duration > 45 minutes
- 70% of users return within 7 days after first test
- Net Promoter Score (NPS) > 40 within first 6 months
- < 5% user-reported bugs per 1000 active users

### Performance & Reliability
- 99.5% uptime during peak exam preparation months
- Zero data loss incidents with automatic retry on network drops
- API response time p95 < 200ms under normal load
- Support 100K concurrent test takers without degradation
- Page load time < 1.5 seconds on 3G connections
- Graceful reconnection handling during test-taking (auto-retry with exponential backoff)

### Learning Effectiveness
- 60% of users show measurable score improvement after 5 tests
- Topic-wise accuracy insights generated within 5 seconds of test submission
- 80% of users report weak area identification as "accurate" or "very accurate"

### Business & Conversion
- 15% free-to-paid conversion rate within first month
- 90% subscription renewal rate for satisfied users
- Generate 10K mock tests per month by month 6

### Compliance & Security
- 100% parental consent verification for users under 18
- Zero PCI DSS compliance violations
- Data breach notification within 72 hours (DPDP Act compliance)
- Complete security audit (OWASP ASVS Level 2) by launch
- 100% data localization compliance (all data in India)

### Content Quality
- 95% of AI-generated questions rated "exam-like" by subject matter experts
- < 2% question error rate (incorrect answers, unclear wording)
- All questions have verified explanations reviewed by experts
- Content covers 100% of official exam syllabus

## Non-Functional Requirements

### Performance
- Test loading: < 2 seconds
- Question rendering: < 100ms
- API response time: < 200ms (95th percentile)
- Database queries: < 50ms (95th percentile)
- Support 100K+ concurrent users
- 60fps minimum animation performance on low-end Android devices (React Native mobile apps)
- Real-time sync latency: < 500ms for state updates across devices

### Scalability
- Database design must handle 100K+ users
- Horizontal scaling for API servers
- Question bank: Store millions of questions
- Containerized deployment (Docker)
- Infrastructure as Code (Terraform/Ansible)

### Reliability
- 99.5% uptime SLA
- Automatic backups daily
- 3-2-1 Backup Rule: 3 copies, 2 different media, 1 offsite
- Data recovery plan with tested restoration procedures
- Comprehensive logging for debugging
- Public status page for transparency
- Post-mortems for all incidents

### Observability & Monitoring
- **Critical Alerts** (PagerDuty with 24/7 on-call):
  - Service downtime (any endpoint unavailable >2 minutes)
  - API response time p95 >500ms (sustained for 5 minutes)
  - Database connection failures
  - Payment gateway failures
  - Error rate >5% of requests
- **Warning Alerts** (Slack notifications):
  - API response time p95 >300ms (sustained for 10 minutes)
  - Error rate >1% of requests
  - Memory usage >80%
  - CPU usage >75% sustained
  - Disk space <20% remaining
- **Metrics tracked**: Request latency, error rates, throughput, database query performance, cache hit rates, payment success rates
- **Logging**: Centralized logging with structured JSON format, retention 90 days
- **Dashboards**: Real-time performance dashboards accessible to all engineers

### Security & Compliance
- HTTPS everywhere (TLS 1.3)
- Data encryption at rest (AES-256) and in transit
- OWASP ASVS Level 2 compliance
- PCI DSS compliance for payments via Razorpay or Cashfree (tokenization, SAQ A)
- DPDP Act 2023 compliance for data protection
- All student data stored within India
- Parental consent for users under 18
- Penetration testing annually
- Vulnerability scanning continuous
- Test integrity protection:
  - Server-authoritative timer (prevents time manipulation)
  - Submission validation (reject if elapsed time exceeds allowed duration)
  - Real-time sync prevents answer sharing across devices for same user
