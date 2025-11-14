# Functional Specification: EduTech

## Project Overview
EduTech is a subscription-based platform providing AI-powered mock tests for competitive exams in India. Starting with IIT-JEE and NEET, the platform analyzes past papers and generates realistic mock tests while providing personalized improvement recommendations.

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

## UI/UX Design Standards

### Design Philosophy
- **Inspiration**: Khan Academy (clean, minimal), Duolingo (gamification), Brilliant.org (visual progress)
- **Design System**: Material Design 3 with custom EduTech branding
- **No Blank Pages**: Every screen must have graphics, illustrations, or helpful content
- **Mobile-First**: Design for mobile, scale up to desktop

### Visual Design
- **Color Palette**:
  - Primary: Educational Blue (#1976D2)
  - Secondary: Success Green (#4CAF50)
  - Accent: Achievement Gold (#FFC107)
  - Error: Alert Red (#F44336)
  - Background: Clean White (#FFFFFF) with subtle gray (#F5F5F5)
- **Typography**:
  - Headings: Poppins (bold, clean)
  - Body: Inter (readable, modern)
  - Code/Math: JetBrains Mono (equations, formulas)
- **Spacing**: 8px grid system for consistent spacing
- **Icons**: Material Icons with custom achievement badge icons

### Component Library
- **Buttons**: Primary (solid), Secondary (outline), Text (minimal)
- **Cards**: Elevated cards for tests, flat cards for content
- **Loading States**: Skeleton screens (not spinners) for better perceived performance
- **Empty States**: Custom illustrations with actionable CTAs
  - No tests taken: "Start your first test" with motivational graphic
  - No resources: "Explore learning materials" with book illustration
  - No progress: "Take a test to see your progress" with chart graphic

### Key Screen Designs

#### Test-Taking Interface
- **Layout**: Fixed header (timer), question content (center), navigation palette (right sidebar on desktop, bottom sheet on mobile)
- **Timer**: Large, always visible, color-coded (green >50% time, yellow 20-50%, red <20%)
- **Question Palette**: Grid view showing all questions with status indicators (attempted, unattempted, marked for review)
- **Navigation**: Clear "Previous" and "Next" buttons, "Submit Test" in bottom-right
- **Distraction-Free**: No ads, minimal UI chrome, optional fullscreen mode

#### Results Dashboard
- **Hero Section**: Large score display with circular progress indicator
- **Performance Breakdown**: Subject-wise bar charts, topic-wise heatmap
- **Comparison**: Line chart showing score trend over time
- **Insights**: AI-powered weak area cards with actionable recommendations
- **Gamification**: Achievement badges prominently displayed

#### Solution Review (Split-Screen)
- **Left Panel (30%)**: Question palette with color-coded status (green=correct, red=incorrect, gray=unattempted)
- **Right Panel (70%)**: 
  - Question text with user's answer highlighted
  - Correct answer in green box
  - Step-by-step explanation with diagrams
  - Concept tags (clickable to see related questions)
  - "Bookmark" and "Report Issue" actions

#### Progress Page
- **Streak Display**: Calendar heatmap showing daily activity (GitHub-style)
- **Stats Cards**: Tests taken, average score, time spent, improvement percentage
- **Topic Mastery**: Circular progress rings for each subject
- **Badges**: Achievement showcase with locked/unlocked states
- **Next Steps**: AI recommendations in card format

### Accessibility Requirements (WCAG 2.1 Level AA)
- **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- **Keyboard Navigation**: All interactive elements accessible via Tab/Enter/Space
- **Screen Reader**: ARIA labels on all icons and interactive elements
- **Focus Indicators**: Clear 2px blue outline on focused elements
- **Text Resize**: UI remains usable at 200% zoom
- **Alternative Text**: All images have descriptive alt text

### Responsive Breakpoints
- **Mobile**: 320px - 767px (single column, bottom navigation)
- **Tablet**: 768px - 1023px (two columns, side navigation)
- **Desktop**: 1024px+ (three columns, full sidebar)

### Animation & Microinteractions
- **Page Transitions**: Fade (200ms) for content changes
- **Button Clicks**: Scale down (100ms) for tactile feedback
- **Loading**: Skeleton screens with shimmer effect
- **Success**: Confetti animation for achievements (Lottie)
- **Performance**: 60fps minimum, hardware-accelerated transforms

### Graphics & Illustrations
- **Source**: UnDraw (free, customizable) for generic illustrations
- **Custom**: Achievement badges, mascot character (optional), onboarding graphics
- **Format**: SVG for scalability, WebP for photos
- **Optimization**: Lazy loading for below-fold images

## User Stories & Acceptance Criteria

> **Note**: User stories below follow traditional format. For SpecKit-compliant feature specifications with Given-When-Then scenarios and priorities, each story should be converted to a separate feature spec using `/specify [feature description]`.

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
- **[DPDP Act 2023]** Users under 18 MUST provide verifiable parental consent during registration
- **[Parental Consent Verification]** Multi-level approach:
  - **Phase 1 (MVP)**: Email/phone verification with explicit consent click-through
  - Parent receives verification email with clear consent terms
  - Parent must click "I consent" with timestamp recorded
  - Confirmation sent to both parent and child
  - **Phase 2 (Optional)**: Document upload option for premium features or fraud prevention
  - Upload parent ID + child's birth certificate/school ID
  - Manual review by compliance team within 24 hours
- **[DPDP Act 2023]** Parent/guardian email and phone verification required for minors
- Social login options (Google, Apple) with open-source OAuth implementation
- Email/SMS verification required
- Password reset functionality
- Session management across devices
- **[Data Localization]** All user data stored in India-based infrastructure
- Transparent privacy policy in English and Hindi
- User rights: Access, correction, deletion of personal data

### US-2: Exam Type Selection (Priority: P2)
**As a** student  
**I want to** browse and select from available competitive exams  
**So that** I can prepare for my target exam

**Why this priority**: P2 - Important for user experience but not blocking. Can launch with pre-seeded exams initially.

**Independent Test**: View exam list, filter by category, view exam details with syllabus. Works independently without other features.

**Acceptance Criteria:**
- Display available exams (IIT-JEE, NEET initially)
- Show exam details: pattern, syllabus, duration, dates
- Filter by exam category
- Admin can add new exam types without code changes

### US-3: Subscription Management
**As a** student  
**I want to** choose and purchase a subscription plan  
**So that** I can access mock tests based on my needs

**Acceptance Criteria:**
- Three subscription types:
  - **Free Tier**: 1 free mock test (lifetime per user)
  - **Bundle Tier**: 
    - 10 tests = ₹499 (6 months validity)
    - 25 tests = ₹999 (6 months validity)
    - 50 tests = ₹1,699 (6 months validity)
  - **Unlimited Tier**:
    - Single exam (JEE Main/Advanced or NEET): ₹799/month or ₹7,999/year
    - All exams: ₹1,199/month or ₹11,999/year
- Clear pricing display with tier comparison
- **[Payment Integration]** Hybrid open-source approach:
  - Use open-source SDK/libraries (research Juspay open APIs, Cashfree SDK alternatives)
  - Backend integration with PCI DSS compliant payment processor
  - Support UPI, credit/debit cards, net banking, wallets
  - SAQ A compliance (token-only, no card data storage)
- Payment processing via tokenization (no card data stored locally)
- Subscription status visible on dashboard
- Auto-renewal for unlimited plans with 7-day advance notification
- **[DPDP Act]** 7-day grace period on payment failures with limited access (can review past tests, cannot start new tests)
- **[Refund Policy]**:
  - Full refund within 7 days if zero tests attempted
  - No refund after attempting any test (content consumed)
  - Pro-rated refund for unused portion of annual unlimited plans (cancellation)
  - Full refund regardless of time if technical failure prevents test-taking
- **[No Dark Patterns]** Easy-to-find cancel/downgrade options with one-click access

### US-4: AI Mock Test Generation
**As a** student  
**I want to** generate a mock test that resembles the actual exam  
**So that** I can practice under realistic conditions

**Acceptance Criteria:**
- AI analyzes past years' question papers for patterns
- Generates questions matching exam difficulty distribution
- Follows official exam structure (sections, question types, marks)
- Questions are unique per test with minimal repetition (max 10% questions repeated across tests in 30-day period)
- Test adheres to official time limits
- Covers syllabus based on exam weightage
- **[Test Retakes]**: Unlimited retakes allowed
  - Each attempt counts as 1 test credit from subscription
  - Encourages learning through repetition
  - Different question variations for retakes where possible

### US-5: Taking Mock Tests
**As a** student  
**I want to** take a mock test in an exam-like environment  
**So that** I can simulate the actual test experience

**Acceptance Criteria:**
- Timer countdown visible throughout
- Question navigation (next, previous, jump to question)
- Mark for review functionality
- Question palette showing attempted/unattempted/marked questions
- Auto-submit when time expires
- **[Offline Support - Critical]** Mobile apps MUST support full offline test-taking
- **[Offline Support]** Download test content before starting (questions, images, options)
- **[Offline Support]** Save responses locally; auto-sync when connection restored
- **[Offline Support]** Handle network interruptions gracefully without data loss
- **[Offline Conflict Resolution]**: Test locked to device where "Start Test" clicked
  - Once test started on one device, cannot start same test on another device
  - Can view results on any device after submission
  - Prevents synchronization conflicts and gaming
- No distractions (clean UI, fullscreen option)
- **[Performance]** Question rendering must be instant (no loading delays)
- **[Timer Synchronization]**: Hybrid server-client approach
  - Get authoritative server timestamp when test starts
  - Run countdown locally on client for performance
  - Validate total elapsed time on server at submission
  - Reject submission if time manipulation detected
  - Server time always takes precedence
- **[Security]** Prevent screenshot/screen recording during active test:
  - Terms of Service explicitly forbids screenshots/sharing
  - Detect screenshot attempts and log with warning shown to user
  - Subtle watermark (user ID) on question palette
  - Account suspension if content sharing detected
  - Accept some leakage inevitable, minimize with legal consequences

### US-6: Instant Results & Scoring
**As a** student  
**I want to** see my test results immediately after submission  
**So that** I can understand my performance quickly

**Acceptance Criteria:**
- Display total score, percentage, percentile (if available)
- Subject-wise/section-wise breakdown
- Time spent on each section
- Accuracy rate per subject
- Comparison with previous attempts
- Visual representation (charts/graphs)

### US-7: Detailed Solution Review
**As a** student  
**I want to** review all questions with solutions and explanations  
**So that** I can learn from my mistakes

**Acceptance Criteria:**
- **[UI Layout]**: Split view (recommended)
  - Left: Question palette showing correct/incorrect/unattempted status
  - Right: Selected question detail with solution
  - Click any question in palette to view its detail
- Display each question with:
  - User's selected answer (highlighted in red if wrong, green if correct)
  - Correct answer (highlighted in green)
  - Detailed explanation of the solution
  - Concept tags (topics covered) - e.g., "Kinematics", "Thermodynamics", "Organic Chemistry"
  - Difficulty level
- Filter questions by: Correct/Incorrect/Unattempted/Marked
- Navigation between questions in review mode
- "Mark for Later Review" option to save specific questions

### US-8: Personalized Improvement Analysis
**As a** student  
**I want to** see which topics I should focus on  
**So that** I can optimize my study time

**Acceptance Criteria:**
- AI identifies weak topics based on wrong answers
- Shows accuracy rate per topic/chapter
- Prioritizes topics by: Frequency in exam × User's weakness
- Suggests focused topics instead of entire syllabus
- Progress tracking over time (improvement graph)
- Comparison: Current performance vs previous tests

### US-9: Curated Learning Resources
**As a** student  
**I want to** access learning materials for my weak topics  
**So that** I can improve without searching externally

**Acceptance Criteria:**
- For each weak topic, provide:
  - Concept summary/notes
  - Video explanations (embedded or linked)
  - Practice questions (graded difficulty)
  - Related formulas/diagrams
- Content is exam-specific (IIT-JEE vs NEET coverage differs)
- Bookmarking resources for quick access later
- Progress tracking on consumed resources

### US-10: Progress Dashboard
**As a** student  
**I want to** view my overall preparation progress  
**So that** I can track improvement over time

**Acceptance Criteria:**
- Number of tests taken
- Average score trend (line graph)
- Topic-wise mastery levels
- Time spent on platform
- Upcoming tests or exam dates reminder
- Streak counter (daily activity)
- **[Gamification]** Achievement badges (ADOPTED):
  - **Streak Badges**: 7-day streak, 30-day streak, 100-day streak
  - **Volume Badges**: 10 tests completed, 50 tests completed, 100 tests completed
  - **Excellence Badge**: First perfect score (100%)
  - **Improvement Badge**: 20% score increase from baseline
  - **Phase 2 Badges** (based on user engagement analytics): Topic Master (95%+ accuracy in one topic), Consistency Champion (tests taken 5 days/week for 4 weeks), Speed Demon (complete test in < 75% of allotted time with >80% accuracy)

### US-11: Admin Content Management
**As an** admin  
**I want to** manage exam content and question banks  
**So that** I can keep the platform updated

**Acceptance Criteria:**
- Add/edit/delete exam types
- Upload question banks (bulk import)
- Tag questions with topics, difficulty, year
- Set exam patterns and syllabus
- Review AI-generated questions for quality
- Update learning resources (videos, notes)

## Functional Requirements

### FR-1: AI Mock Test Engine
- **[LLM Selection & Strategy]**:
  - **Azure OpenAI Service (AOAI)**:
    - **Model**: GPT-5 (latest generation)
    - **Deployment**: Azure OpenAI Service in Central India region
    - **Authentication**: Azure Key Vault for API key storage
    - **Cost Estimation**:
      - GPT-5: Pricing to be announced by Microsoft/OpenAI
      - Estimated: ~$2-5K/month for 100K questions/month (subject to actual pricing)
    - **Rate Limits**: Configurable based on Azure OpenAI quota
  - **Generation Strategy**: 
    - Nightly batch generation to populate test pool
    - Azure Functions or Container Jobs for scheduled generation
    - On-demand generation available with wait time notification if pool depleted
    - Queue system displays estimated wait time (30-60 seconds)
  - **Fallback**: Always maintain pre-generated question bank (minimum 1000 questions per exam type) in Azure Blob Storage
  - **Monitoring**: Track token usage, costs, generation quality via Azure Monitor
- Analyze past 10+ years of exam papers
- Extract question patterns, topics, difficulty distribution
- Generate new questions maintaining exam authenticity
- **[Quality over Quantity]** All AI-generated questions MUST have verified explanations
- **[SME Review Workflow]**:
  - **Internal Triage**: Content managers perform first-pass review (grammar, completeness, formatting)
  - **External Validation**: Subject Matter Expert (SME) review for accuracy
  - **Approval Requirements**:
    - 2 SME approvals for questions on new topics or complex concepts
    - 1 SME approval for variations of previously reviewed questions
  - **Review Criteria**: Accuracy, difficulty appropriateness, exam-relevance, explanation quality, no ambiguity
  - **Rejection Workflow**: Flagged questions returned to AI with feedback for regeneration
  - **Timeline**: Reviews completed within 48 hours for content pipeline
- **[Data-Driven]** Recommendations based on performance analysis, not generic suggestions

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
- **[Percentile Calculation]**: Show when minimum 50 users have taken same test
  - Calculate in percentile bands (Top 10%, 25%, 50%, 75%, etc.)
  - Update nightly via batch job (not realtime)
  - Fully anonymized comparisons, no individual ranking
  - Display as "You performed better than X% of students"

### FR-4: Content Delivery System
- Store and retrieve learning resources (videos, PDFs, images)
- CDN integration for fast content delivery
- Organize content by exam → subject → topic hierarchy
- Version control for content updates

### FR-5: Subscription & Payment System
- Manage subscription tiers and access control
- **[API-Level Enforcement]** Subscription enforcement at API level, never client-side
- Process payments securely
- **[No Local Storage]** Payment info MUST NOT be stored locally (tokenization only)
- Handle refunds and cancellations
- **[Business Rule]** 7-day grace period on payment failure before access revocation
- **[Business Rule]** Full refund within 7 days if no tests taken
- Send renewal reminders
- Generate invoices
- **[Open Source]** Use open-source payment gateway integration

### FR-6: Notification System
- Email notifications: Registration, subscription, test completion
- Push notifications (mobile): Reminders, new features, exam dates
- In-app notifications: Personalized recommendations

## Key Entities

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
- **[Difficulty Calibration]**: Adaptive methodology
  - Phase 1: SMEs manually tag as Easy/Medium/Hard during review
  - Phase 2: Validate tags with first 100 user attempts per question
  - Phase 3: Refine using Item Response Theory (IRT) model after 500+ attempts
  - Percentile-based adjustment: 75%+ solve = Easy, 50-75% = Medium, <50% = Hard
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
- Timestamp

### Subscription
- User reference
- Plan type: Free, Bundle, Unlimited
- Start date, end date
- Status: Active, Expired, Cancelled, Grace period
- Payment history
- Remaining test credits (for bundles)

### LearningResource
- Type: Video, PDF, Notes, Practice questions
- Associated topics/concepts
- Exam relevance
- External links or hosted content
- Quality rating
- **[Content Sourcing Strategy]**:
  - **Phase 1 (MVP)**: Curate best free resources (Khan Academy, NPTEL) for top 20 high-impact topics
  - **Phase 2**: Partner with 2-3 YouTube educators for exclusive/embedded content
  - **Phase 3**: Build in-house content for gaps based on user demand and feedback
  - Prioritize topics by: User weakness frequency × Exam weightage

### Analytics
- User performance metrics
- Topic-wise accuracy
- Weak areas identification
- Progress trends over time
- Peer comparison data (anonymized)

## Edge Cases & Error Scenarios

### Registration & Authentication
- What happens if parent email verification fails for a minor? **[RESOLVED]** Show error, allow retry with different parent email, or contact support for manual verification
- How to handle duplicate registrations (same email/phone)? **[RESOLVED]** Prevent at database level, show "Email already registered" with password reset link
- What if user forgets password and doesn't have access to registered email/phone? **[RESOLVED]** Support ticket with ID verification required for account recovery
- How to verify parental consent authenticity? **[RESOLVED]** Email/phone verification Phase 1, optional document upload Phase 2 for fraud cases

### Subscription & Payment
- User starts test with active subscription, but it expires mid-test - can they finish? **[RESOLVED]** Yes, 15-minute grace period to finish active test. Check subscription at test start, allow completion within reasonable time.
- Payment gateway timeout during transaction - how to verify payment status? **[RESOLVED]** Webhook verification + polling payment gateway API every 30 seconds for 5 minutes. Show "Payment verification in progress" message.
- User requests refund after partially completing tests - how to handle? **[RESOLVED]** No refund after attempting any test (content consumed). Full refund only if zero tests attempted within 7 days.
- Multiple payment attempts for same subscription - prevent duplicate charges? **[RESOLVED]** Idempotency keys on payment API, check for duplicate transactions within 5-minute window.

### Test Taking
- Device battery dies during test - can user resume? **[RESOLVED]** Yes, auto-save every 30 seconds. Can resume from last saved state within test time limit.
- Network drops during sync after offline test - how many retry attempts? **[RESOLVED]** Auto-retry with exponential backoff: 3 immediate retries, then every 5 min for 1 hour, then show manual sync option.
- User closes browser/app accidentally during test - auto-save state? **[RESOLVED]** Yes, auto-save every 30 seconds. Session persists for 24 hours or until test time expires.
- Timer and device time mismatch - which takes precedence? **[RESOLVED]** Server time is authoritative. Get server timestamp at start, validate total elapsed time at submission, reject if manipulation detected.
- What if AI fails to generate enough questions for a test? **[RESOLVED]** Serve from pre-generated fallback question bank (min 1000 questions per exam). Show "Generated test" vs "Curated test" badge.

### Content & Data
- Question has incorrect answer in database - how to handle past test results? **[RESOLVED]** Retroactive correction: Recalculate all affected test scores, send notification to impacted users with updated scores. Log all corrections for audit trail and transparency.
- Image fails to load during test - fallback mechanism? **[RESOLVED]** 
  - Pre-download all images before test starts (prevent most failures)
  - Auto-retry 3 times with exponential backoff if image fails
  - If still fails, show "Report Issue" button
  - Manual review team investigates within 24 hours, refunds or recalculates score if legitimate issue
- Learning resource link becomes broken - monitoring and alerts? **[RESOLVED]** Weekly automated link checker, alert content team, replace broken links within 48 hours.
- Database corruption - recovery process? **[RESOLVED]** Automated daily backups with 3-2-1 rule. Point-in-time recovery capability. Tested restoration procedures quarterly.

### Performance & Scale
- 10K users start tests simultaneously - queue management? **[RESOLVED]** Horizontal scaling with load balancer. Pre-generated test pool serves instantly. Queue only for on-demand generation with wait time displayed.
- Database query timeout - graceful degradation? **[RESOLVED]** Query timeout set to 5 seconds, retry once, fallback to cached data if available, show user-friendly error message.
- CDN fails - fallback content delivery? **[RESOLVED]** Multi-CDN strategy (primary + backup). Origin server as final fallback. Monitor CDN health continuously.
- AI service becomes unavailable - use pre-generated question bank? **[RESOLVED]** Yes, always serve from fallback pre-generated question bank (min 1000 questions per exam). Background job alerts DevOps of LLM failure.

### Compliance & Privacy
- User under 18 turns 18 - update consent requirements? **[RESOLVED]** Automatic account status update on birthday. Send congratulatory email to user, notify parent their consent no longer required. Anonymize parent data (keep consent record with dates, remove PII).
- Parent requests data deletion for their child - verification process? **[RESOLVED]** Verify parent identity via original consent email. Require explicit deletion request with reason. Process within 30 days per DPDP Act.
- Data breach detected - notification workflow? **[RESOLVED]** 
  - Incident response team assesses severity within 2 hours
  - If unauthorized access to any PII confirmed: Notify affected users within 72 hours via email/SMS
  - Report to Data Protection Board and CERT-In as required
  - Public disclosure on status page if affects >1000 users
  - Post-mortem published within 7 days
- User in different country (not India) - handle data localization? **[RESOLVED]** Allow access from anywhere (data localization = storage location, not user location restriction). Data always stays in Indian data centers. Confirm with legal team before launch.

## Success Criteria

### Measurable Outcomes

#### User Engagement & Satisfaction
- **SC-001**: 90% of users successfully complete their first mock test without technical issues
- **SC-002**: Users can start a test within 30 seconds of clicking "Begin Test"
- **SC-003**: Average continuous session duration > 45 minutes (indicates deep engagement, not total daily time)
- **SC-004**: 70% of users return within 7 days after first test (retention metric)
- **SC-005**: Net Promoter Score (NPS) > 40 within first 6 months
- **SC-006**: < 5% user-reported bugs per 1000 active users

#### Performance & Reliability
- **SC-007**: 99.5% uptime during peak exam preparation months
- **SC-008**: Zero data loss incidents during offline-to-online sync
- **SC-009**: API response time p95 < 200ms under normal load
- **SC-010**: Support 100K concurrent test takers without degradation
- **SC-011**: Page load time < 1.5 seconds on 3G connections

#### Learning Effectiveness
- **SC-012**: 60% of users show measurable score improvement after 5 tests
- **SC-013**: Topic-wise accuracy insights generated within 5 seconds of test submission
- **SC-014**: 80% of users report weak area identification as "accurate" or "very accurate"
- **SC-015**: Average time to complete solution review < 15 minutes per test

#### Business & Conversion
- **SC-016**: 15% free-to-paid conversion rate within first month
- **SC-017**: Reduce support tickets related to payment issues by 80% (vs industry avg)
- **SC-018**: 90% subscription renewal rate for satisfied users
- **SC-019**: Generate 10K mock tests per month by month 6

#### Compliance & Security
- **SC-020**: 100% parental consent verification for users under 18
- **SC-021**: Zero PCI DSS compliance violations
- **SC-022**: Data breach notification within 72 hours (DPDP Act compliance)
- **SC-023**: Complete security audit (OWASP ASVS Level 2) by launch
- **SC-024**: 100% data localization compliance (all data in India)

#### Content Quality
- **SC-025**: 95% of AI-generated questions rated "exam-like" by subject matter experts
- **SC-026**: < 2% question error rate (incorrect answers, unclear wording)
- **SC-027**: All questions have verified explanations reviewed by experts
- **SC-028**: Content covers 100% of official exam syllabus

## Non-Functional Requirements

### Performance
- Test loading: < 2 seconds
- Question rendering: < 100ms (no loading delays perceived as "instant")
- API response time: < 200ms (95th percentile) [per constitution]
- Database queries: < 50ms (95th percentile)
- Support 100K+ concurrent users (designed for scale from day one)
- **[Mobile Performance]** 60fps minimum animation performance on low-end Android devices (Snapdragon 450 or equivalent)

### Scalability
- Database design must handle 100K+ users
- Horizontal scaling for API servers
- Question bank: Store millions of questions
- **[Infrastructure]** Containerized deployment (Docker)
- **[Infrastructure]** Infrastructure as Code (Terraform/Ansible)

### Reliability
- 99.5% uptime SLA
- Automatic backups daily
- **[3-2-1 Backup Rule]** 3 copies, 2 different media, 1 offsite
- Data recovery plan with tested restoration procedures
- **[Monitoring]** Comprehensive logging for debugging
- **[Monitoring]** Public status page for transparency
- **[Incident Response]** Post-mortems for all incidents

### Usability
- Mobile-first design
- Accessible (WCAG 2.1 Level AA compliance) [per constitution]
- Support for regional languages (future)
- **[Low Bandwidth]** Optimized for low-bandwidth connections
- **[No Dark Patterns]** Ethical design principles throughout

### Documentation Requirements

#### API Documentation
- **OpenAPI/Swagger**: All endpoints must have OpenAPI 3.0 specification
- **Auto-Generation**: Use `swagger-jsdoc` or `tsoa` for automatic spec generation from code
- **Hosting**: Swagger UI hosted at `/api-docs` endpoint
- **Examples**: Include request/response examples for all endpoints
- **Error Codes**: Document all possible error responses with descriptions
- **Authentication**: Clear documentation of JWT token usage

#### Code Documentation
- **TypeScript/JSDoc**: All functions must have JSDoc comments
  ```typescript
  /**
   * Generates a mock test for the specified exam type
   * @param examId - The unique identifier of the exam
   * @param userId - The user requesting the test
   * @returns Promise resolving to generated test with questions
   * @throws {InsufficientQuestionsError} When question pool is depleted
   */
  async function generateMockTest(examId: string, userId: string): Promise<MockTest>
  ```
- **Parameters**: Document all parameters with types and descriptions
- **Return Values**: Document return types and possible values
- **Exceptions**: Document all thrown errors and when they occur
- **Examples**: Include usage examples for complex functions

#### Architecture Documentation
- **Living Documentation**: Maintain in Docusaurus or similar static site generator
- **C4 Model Diagrams**: 
  - Context: System boundaries and external dependencies
  - Container: High-level technology choices
  - Component: Internal structure of each service
  - Code: Class diagrams for complex modules (optional)
- **Architecture Decision Records (ADRs)**: Document all major technical decisions
  - Template: Title, Status, Context, Decision, Consequences
  - Examples: "ADR-001: Choice of React Native over Native Apps"
- **Update Frequency**: Review and update quarterly or when major changes occur

#### Developer Onboarding Documentation
- **README.md**: 
  - Project overview and tech stack
  - Prerequisites (Node.js version, Docker, etc.)
  - Quick start guide (clone, install, run)
  - Environment variables setup
  - Common issues and troubleshooting
- **CONTRIBUTING.md**:
  - Coding standards (ESLint, Prettier config)
  - Git workflow (feature branches, PR process)
  - Testing guidelines (coverage requirements)
  - Code review checklist
- **Development Guide**:
  - Local development setup with Docker Compose
  - Database migrations and seeding
  - Running tests (unit, integration, E2E)
  - Debugging tips and tools

#### Runbooks (Operations)
- **Deployment**: Step-by-step deployment procedures
- **Rollback**: How to rollback failed deployments
- **Database Restoration**: Quarterly tested restoration procedures
- **Incident Response**: On-call playbooks for common incidents
- **Monitoring**: Dashboard URLs, alert meanings, escalation paths

### Security & Compliance

#### Data Protection & Privacy (DPDP Act 2023)
- **[DPDP - Parental Consent]** Explicit parental consent for users under 18
- **[DPDP - Data Minimization]** Collect only essential data for service delivery
- **[DPDP - Purpose Limitation]** Use data only for stated educational purposes
- **[DPDP - Storage Limitation]** Retain data max 3 years after account closure
- **[DPDP - Transparency]** Privacy policy in English and Hindi
- **[DPDP - User Rights]** Right to access, correction, and deletion
- **[DPDP - Breach Notification]** Notify users within 72 hours of data breach
- **[DPDP - DPO]** Designated Data Protection Officer appointed
- **[Data Localization]** All student data stored within India

#### Application Security
- HTTPS everywhere (TLS 1.3)
- Data encryption at rest (AES-256) and in transit
- **[OWASP ASVS Level 2]** Compliance with Application Security Verification Standard
- **[1EdTech TrustEd Apps]** EdTech industry security practices compliance
- PCI DSS compliance for payments
- Rate limiting to prevent abuse
- **[Security Testing]** Penetration testing annually
- **[Security Testing]** Vulnerability scanning continuous
- **[Content Protection]** Prevent unauthorized copying of test content
- **[Authentication]** Required for all premium features

#### Development & Operations Security
- **[Code Quality]** Minimum 80% code coverage
- **[Code Review]** All code requires 2+ peer reviews
- **[Security Review]** Auth and payment code requires senior developer approval
- **[Documentation]** All code must be documented
- **[Self-Hosted]** Full data ownership via self-hosted infrastructure
- **[Open Source Stack]** 100% open-source technology stack (no vendor lock-in)

#### Backup & Disaster Recovery (3-2-1 Rule)

**Copy 1: Production Database (Primary)**
- **Location**: Azure Database for PostgreSQL (Central India)
- **Method**: Automated point-in-time recovery (built-in Azure feature)
- **Retention**: 35 days of continuous backup
- **RPO**: < 5 minutes (transaction log backups)
- **RTO**: < 15 minutes (restore from backup)

**Copy 2: Nightly Snapshots (Different Media)**
- **Location**: Azure Blob Storage (Cool tier, Central India)
- **Method**: `pg_dump` via scheduled Azure Function (23:00 IST daily)
- **Format**: Compressed SQL dump (.sql.gz)
- **Retention**: 90 days (rolling deletion)
- **Verification**: Automated integrity check after each dump

**Copy 3: Cross-Region Replication (Offsite)**
- **Location**: Azure Blob Storage (South India region)
- **Method**: GRS (Geo-Redundant Storage) automatic replication
- **Sync**: < 15 minutes RPO
- **Purpose**: Disaster recovery if Central India region fails
- **Failover**: Manual failover with documented runbook

**Restoration Testing**
- **Frequency**: Quarterly (every 3 months)
- **Process**: 
  1. Restore latest backup to staging environment
  2. Validate data integrity (row counts, checksums)
  3. Run test queries to verify functionality
  4. Document any issues found
  5. Update runbook with lessons learned
- **Success Criteria**: Full restoration within 1 hour, zero data loss
- **Documentation**: Runbook with step-by-step procedures maintained in Confluence/Notion

**Backup Monitoring & Alerts**
- **Metrics**: Backup success/failure, backup size, backup duration
- **Alerts**: 
  - Critical: Backup failed for 2 consecutive days → PagerDuty
  - Warning: Backup size increased >50% → Slack
  - Warning: Backup duration >2 hours → Slack

---

## Recommendations for Next Steps

### 1. Break Into Individual Feature Specs ⚠️ STILL RECOMMENDED
This monolithic specification should be split into individual feature specs following the SpecKit template:
- `/specify User registration with DPDP Act parental consent for minors`
- `/specify AI mock test generation using self-hosted open-source LLMs`
- `/specify Offline-first mobile test taking with background sync`
- `/specify Subscription management with open-source payment integration`
- `/specify Personalized learning analytics and weak area identification`

Each feature spec will have:
- Prioritized user journeys (P1, P2, P3)
- Given-When-Then acceptance scenarios (see US-1 as example)
- Independent test criteria
- Edge cases specific to that feature
- Measurable success criteria

### 2. Convert Remaining User Stories to Given-When-Then Format ⚠️ STILL RECOMMENDED
Currently only US-1 has been enhanced with proper acceptance scenarios. Remaining user stories (US-2 through US-11) need similar treatment with:
- Priority assignment based on value delivery
- Independent testability criteria
- Concrete Given-When-Then scenarios
- Edge case coverage

Example format (see US-1):
```
**Given** [initial state]
**When** [user action]
**Then** [expected outcome]
**And** [additional verification]
```

### 3. Technology Stack Selection ✅ ADOPTED
**Status**: Recommendations have been fully adopted and documented in "Technology Stack" section above.

Key Decisions Made:
- **Mobile**: React Native (cross-platform)
- **Backend**: Node.js with TypeScript + Express.js
- **Database**: PostgreSQL + Redis
- **LLM**: Mistral 7B (Phase 1) → Llama 3.3 (Phase 2)
- **Infrastructure**: AWS Mumbai / GCP Mumbai
- **Monitoring**: Prometheus + Grafana + Loki

### 4. Clarifications ✅ RESOLVED
**Status**: All 34 critical clarifications have been addressed and decisions documented.

Major Decisions:
- **Payment**: Hybrid open-source approach with SAQ A compliance
- **LLM**: Mistral 7B on cloud GPU with pre-generation strategy
- **Parental Consent**: Email verification (Phase 1) + optional documents (Phase 2)
- **Data Retention**: Anonymize analytics, delete PII, retain financial 7 years
- **Pricing**: ₹499-1699 for bundles, ₹799-11,999 for unlimited tiers

All inline `[NEEDS CLARIFICATION]` markers have been replaced with `[RESOLVED]` decisions in edge cases section.

### 5. Compliance Audit Requirements ⚠️ ACTION REQUIRED
Before launch, these audits must be completed:
- [ ] **Legal review** of privacy policy and terms of service (English + Hindi)
- [ ] **DPDP Act compliance audit** by Indian privacy law expert
- [ ] **OWASP ASVS Level 2** security assessment by third-party
- [ ] **PCI DSS SAQ A** self-assessment completion and quarterly scans
- [ ] **Accessibility audit** (WCAG 2.1 Level AA) using automated + manual testing
- [ ] **Appoint Data Protection Officer (DPO)** - required by DPDP Act

**Timeline**: Start legal and compliance work at least 3 months before launch.

### 6. Performance Benchmarking ⚠️ ACTION REQUIRED BEFORE LAUNCH
Establish baseline metrics and validate against success criteria:

**Required Load Testing**:
- [ ] **Concurrent users**: Verify 100K concurrent test takers without degradation
- [ ] **Database performance**: Validate <50ms p95 query time under load
- [ ] **API response time**: Confirm <200ms p95 under normal load
- [ ] **Mobile performance**: Test on low-end Android devices (4GB RAM, older processors)
- [ ] **Offline sync**: Verify sync with 100+ queued responses completes without data loss
- [ ] **CDN/Network**: Test page load from tier-2/3 Indian cities on 3G connections

**Tools**:
- k6 or Artillery for load testing
- Apache JMeter for database stress testing
- Chrome DevTools for mobile performance profiling
- WebPageTest for real-world network simulation

**Acceptance**:
- All performance metrics in "Success Criteria" section must be met
- Load test reports documented and reviewed
- Performance regression tests added to CI/CD pipeline

### 7. Content Development Strategy ✅ PARTIALLY ADOPTED
**Status**: SME review workflow adopted, content sourcing strategy defined.

**Still Required**:
- [ ] **Partner with Subject Matter Experts**: 
  - Recruit 5-10 SMEs per exam (IIT-JEE, NEET)
  - Define compensation: ₹500-2000 per question reviewed
  - Set up SME portal for review workflow
- [ ] **Create question templates**: Standardize question format, explanation structure
- [ ] **Establish content pipeline**: 
  - Target: 500 questions per subject before MVP launch
  - Goal: 10K+ questions within 6 months
- [ ] **Curate learning resources**: 
  - Identify top 20 high-impact topics per exam
  - Source free content (Khan Academy, NPTEL, YouTube educators)
  - Secure 2-3 exclusive content partnerships
- [ ] **Content update workflow**: 
  - Weekly content review meetings
  - Quarterly syllabus update checks
  - Process for handling exam pattern changes

### 8. Team & Hiring Requirements 🆕 NEW RECOMMENDATION

**Immediate Hires (Before Development)**:
- **1x Tech Lead / Architect**: Owns technical decisions, architecture design
- **2x Full-Stack Developers**: Backend + Frontend (Node.js/React/React Native)
- **1x DevOps Engineer**: Infrastructure, CI/CD, monitoring setup
- **1x UI/UX Designer**: Mobile-first design, accessibility compliance

**Phase 1 Expansion**:
- **2x Mobile Developers**: React Native expertise, offline sync specialist
- **1x Data Scientist / ML Engineer**: LLM fine-tuning, analytics
- **3-5x Content Managers**: SME coordination, question review workflow

**Phase 2+ Hires**:
- **1x Data Protection Officer (DPO)**: DPDP Act compliance (can be part-time initially)
- **Security Engineer**: Penetration testing, security audits
- **Customer Support**: 2-3 support staff as user base grows

**External Consultants**:
- Privacy law expert (DPDP Act compliance)
- Security auditor (OWASP ASVS, PCI DSS)
- Accessibility specialist (WCAG audit)

### 9. Risk Mitigation Plan 🆕 NEW RECOMMENDATION

**Technical Risks**:
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM quality insufficient | Medium | High | Start with Mistral 7B, upgrade to Llama 3.3 if needed. Maintain human-reviewed fallback pool |
| Payment gateway integration issues | Medium | Critical | Research 2-3 gateway options, have backup ready |
| Mobile offline sync bugs | High | High | Extensive testing, gradual rollout, easy rollback mechanism |
| Database performance at scale | Low | High | Start with proven PostgreSQL setup, monitoring alerts, read replicas ready |

**Business Risks**:
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user acquisition | Medium | Critical | Pre-launch marketing, free tier for viral growth, student community outreach |
| High refund rate | Medium | High | Clear value proposition, quality content, responsive support |
| Competition from established players | High | Medium | Differentiate on AI quality, pricing, and UX |
| Regulatory changes (DPDP Act) | Low | High | Monitor regulatory updates, legal counsel on retainer |

**Compliance Risks**:
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| DPDP Act violation | Low | Critical | Legal audit before launch, DPO appointment, strict data policies |
| PCI DSS non-compliance | Low | Critical | SAQ A approach (token-only), quarterly scans, annual assessment |
| Accessibility lawsuit | Very Low | High | WCAG 2.1 AA compliance audit, ongoing testing |

### 10. Go-to-Market Strategy 🆕 NEW RECOMMENDATION

**Pre-Launch (2-3 months before MVP)**:
- Build landing page with email signup (measure interest)
- Create social media presence (Instagram, YouTube for student demographic)
- Partner with 2-3 coaching institutes for pilot program
- Offer free tests to first 100 users for feedback

**Launch**:
- **Free Tier**: Unlimited to validate product-market fit
- **Initial Pricing**: 20% discount for early adopters
- **Referral Program**: Free tests for successful referrals
- **Content Marketing**: Blog posts on exam preparation tips

**Growth Channels**:
- Student communities (Reddit, Discord, WhatsApp groups)
- YouTube collaboration with education channels
- Google/Facebook ads targeting IIT-JEE/NEET keywords
- App Store Optimization (ASO) for mobile discovery

**Success Metrics** (See Success Criteria section for detailed KPIs):
- Month 1: 100 paying users
- Month 3: 500 paying users, 15% conversion rate
- Month 6: 1000 paying users, 70% retention
- Month 12: 10K paying users, 99.5% uptime

---

## Summary of Adopted Recommendations

### ✅ Fully Implemented in Specs
1. **Pricing Strategy**: Detailed tiers with specific prices (₹499-11,999)
2. **Technology Stack**: Complete stack selection documented
3. **LLM Strategy**: Mistral 7B → Llama 3.3 phased approach
4. **Mobile Platform**: React Native selected
5. **Infrastructure**: AWS/GCP Mumbai with clear rationale
6. **Payment Approach**: Hybrid open-source solution
7. **Parental Consent**: Email verification with optional document upload
8. **Data Retention**: Clear policies on delete vs anonymize vs retain
9. **Edge Cases**: All 25+ edge cases resolved with specific decisions
10. **Security**: OWASP ASVS Level 2 and PCI DSS SAQ A requirements detailed
11. **Content Strategy**: SME review workflow, difficulty calibration, question repetition policy
12. **UX Decisions**: Timer sync, offline conflict resolution, image fallback, solution review layout
13. **Gamification**: Specific badges defined
14. **Analytics**: Percentile calculation methodology

### ⚠️ Recommended but Not Yet Adopted
1. **Feature Specs**: Split monolithic spec into individual SpecKit-compliant features
2. **User Stories**: Convert US-2 through US-11 to Given-When-Then format
3. **Compliance Audits**: Schedule legal, security, accessibility audits
4. **Performance Testing**: Conduct load testing before launch
5. **Content Development**: Recruit SMEs, create question bank, curate learning resources
6. **Team Hiring**: Build development and operations team
7. **Risk Mitigation**: Document and monitor identified risks
8. **Go-to-Market**: Execute marketing and growth strategy

### 📊 Readiness Assessment
- **Technical Specifications**: 95% complete ✅
- **Business Rules**: 90% defined ✅
- **Compliance Framework**: 85% documented ✅
- **Implementation Readiness**: 60% (pending team, audits, content) ⚠️

**Next Critical Action**: Begin compliance audits and team hiring while development progresses.



### 3. Technology Stack Selection
Based on the open-source requirement, recommend:
- **Backend**: Node.js/Python with Express/FastAPI
- **Database**: PostgreSQL (with PostGIS for future location features)
- **Caching**: Redis
- **LLM**: Llama 3.3 or Mistral (self-hosted)
- **Payment**: Open-source gateway integrations (research needed)
- **Mobile**: React Native (cross-platform) or native Android/iOS
- **Web**: Next.js or React
- **Infrastructure**: Docker, Kubernetes, Terraform
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitLab CI or GitHub Actions

### 4. Address Clarification Needs
- **Payment Gateway**: Research open-source payment solutions that support Indian payment methods (UPI, cards, net banking) while maintaining PCI DSS compliance
- **LLM Hosting**: Determine infrastructure requirements for self-hosting Llama 3.3 vs Mistral (GPU needs, scaling strategy)
- **Age Verification**: Define process for verifying parent-child relationship (document upload, video verification, etc.)
- **Offline Sync Conflicts**: Algorithm for handling conflicting test responses if user attempts same test on multiple devices offline

## Technology Stack (ADOPTED RECOMMENDATIONS)

### Backend
- **Language**: Node.js with TypeScript (alternative: Python with FastAPI)
- **Framework**: Express.js for API server
- **API Design**: RESTful API with GraphQL for complex queries (optional)
- **Authentication**: JSON Web Tokens (JWT) with refresh token rotation
- **Validation**: Joi or Zod for request validation

### Database & Caching
- **Primary Database**: PostgreSQL 15+
  - JSONB for flexible question storage
  - Full-text search for question lookup
  - Row-level security for multi-tenancy
- **Caching Layer**: Redis 7+
  - Session storage
  - Leaderboard/analytics caching (5-minute TTL)
  - Rate limiting counters
- **Initial Setup**: Single PostgreSQL instance, add read replicas when DB CPU >70%
- **Future**: Partitioning by exam type if query performance degrades

### Mobile Development
- **Platform**: React Native (cross-platform)
- **Rationale**: 
  - Faster time-to-market with single codebase
  - Team can leverage web development skills
  - Strong offline support libraries
  - Can rewrite performance-critical sections natively later
- **Offline Storage**: 
  - SQLite for test data
  - AsyncStorage for user preferences
  - react-native-offline for network state management

### Web Frontend
- **Framework**: Next.js 14+ (React)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand (lightweight)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts or Chart.js for analytics visualization

### AI/ML Infrastructure
- **LLM**: Azure OpenAI Service (AOAI)
- **Model**: GPT-5 (latest generation)
- **Service**: Azure OpenAI Service deployed in Central India region
- **SDK**: Official Azure OpenAI SDK for Node.js/Python
  - Node.js: `@azure/openai` package
  - Python: `openai` package with Azure configuration
- **Authentication**: 
  - API keys stored in Azure Key Vault
  - Managed Identity for Azure services (preferred)
- **Question Generation**: 
  - Batch processing via Azure Functions (Python) or Container Jobs
  - Scheduled overnight generation (23:00 IST)
  - Prompt engineering for exam-specific question formats
- **Fallback**: Pre-generated question pool stored in Azure Blob Storage
- **Cost Management**:
  - Set budget alerts in Azure Cost Management
  - Monitor token usage via Azure Monitor
  - Implement caching for repeated queries

### Payment Integration
- **Approach**: Hybrid open-source
- **Options to Research**:
  - Juspay open APIs (if available)
  - Razorpay/Cashfree SDK with open-source wrapper
  - Direct bank API integration for UPI
- **Compliance**: SAQ A (token-only)
- **Supported Methods**: UPI, Cards, Net Banking, Wallets

### Infrastructure & Hosting
- **Cloud Provider**: Azure (Mumbai/Central India region) for data localization
  - Azure Database for PostgreSQL (managed)
  - Azure Cache for Redis (managed)
  - Azure Blob Storage for content/backups
  - Azure GPU VMs for LLM inference (NC-series or NV-series)
  - Azure Container Instances or AKS for containerized apps
- **Containerization**: Docker + Docker Compose (local), Azure Container Registry
- **Orchestration**: Azure Kubernetes Service (AKS) for production scaling
- **IaC**: Terraform for Azure infrastructure provisioning
- **CI/CD**: 
  - GitHub Actions with Azure integration
  - Automated testing on PR (Jest, Playwright)
  - Staging → Production deployment with approval gates
  - Azure DevOps Pipelines (alternative)
- **CDN**: 
  - Phase 1: Direct server delivery with Azure CDN (basic caching)
  - Phase 2: Azure Front Door (when user base justifies cost)

### Monitoring & Observability
- **Metrics**: Prometheus for scraping, Grafana for visualization
- **Logs**: Loki (centralized logging)
- **Traces**: Tempo (distributed tracing) - optional Phase 2
- **Alerting**: Grafana Alerting → PagerDuty/Slack
- **Error Tracking**: Sentry (open-source compatible)
- **Uptime Monitoring**: UptimeRobot or self-hosted Uptime Kuma
- **Status Page**: Statuspage.io or self-hosted Cachet

### Security Tools
- **Secrets Management**: Azure Key Vault (managed secrets, certificates, keys)
- **Vulnerability Scanning**: 
  - Trivy for container scanning
  - OWASP Dependency-Check for dependencies
  - Snyk (free tier for open source)
  - Azure Defender for Containers (integrated security scanning)
- **WAF**: Azure Application Gateway with WAF or Azure Front Door WAF
- **DDoS Protection**: Azure DDoS Protection Standard
- **Penetration Testing**: Annual third-party audit (required by constitution)

### Development Tools
- **Version Control**: Git + GitHub/GitLab
- **Code Quality**: 
  - ESLint + Prettier (auto-formatting)
  - SonarQube for code analysis
  - Husky for pre-commit hooks
- **Testing**:
  - Jest for unit tests
  - Playwright for E2E tests
  - k6 or Artillery for load testing
- **Documentation**: 
  - Swagger/OpenAPI for API docs
  - Docusaurus for developer documentation

### Third-Party Services (Open-Source Friendly)
- **Email**: SendGrid, Amazon SES, or self-hosted Postal
- **SMS**: Twilio, MSG91, or Gupshup
- **Analytics**: Plausible or Matomo (privacy-friendly, self-hosted)
- **Error Tracking**: Sentry (self-hosted option available)
- **Feature Flags**: Unleash (open-source, self-hosted)

### Development Environment
- **OS**: Linux (Ubuntu/Debian) for servers
- **IDE**: VS Code with recommended extensions
- **Local Development**: Docker Compose for running full stack locally
- **Database GUI**: pgAdmin or DBeaver

---

## Implementation Phases (RECOMMENDED APPROACH)

### Phase 1: MVP (3-4 months)
**Focus**: Core test-taking experience for paying users

**Features**:
- User registration with parental consent (email verification)
- IIT-JEE exam only (add NEET in Phase 2)
- AI question generation (Mistral 7B, pre-generated pool)
- Bundle subscriptions (10, 25, 50 tests)
- Test-taking with timer, navigation, offline support (mobile)
- Results with score breakdown
- Basic solution review
- English UI only

**Technology**:
- Next.js (web), React Native (mobile)
- PostgreSQL + Redis
- AWS Mumbai (single region)
- Mistral 7B on AWS GPU

**Success Metrics**:
- 100 paying users
- 1000 tests taken
- 95% technical success rate
- <5% refund rate

### Phase 2: Growth (4-6 months)
**Focus**: Expand features and improve quality

**Features**:
- NEET exam support
- Unlimited subscription tier
- Personalized analytics (weak areas, improvement trends)
- Learning resources (curated free content)
- Hindi UI support
- Enhanced question quality (Llama 3.3 upgrade if needed)
- Admin dashboard for content management
- SME review workflow

**Technology**:
- Read replicas for database
- CDN for content delivery
- Enhanced monitoring (Loki + Tempo)
- Potentially upgrade to Llama 3.3

**Success Metrics**:
- 1000+ paying users
- 20% free-to-paid conversion
- 70% 7-day retention
- NPS >40

### Phase 3: Scale (6-12 months)
**Focus**: Scale infrastructure and add advanced features

**Features**:
- Additional exams (JEE Advanced, NEET PG, etc.)
- Regional language support (top 5)
- Adaptive difficulty
- Peer comparison (percentile rankings)
- Gamification (badges, streaks)
- Mobile app v2 with enhanced UX
- Content partnerships with educators

**Technology**:
- Multi-region deployment (DR)
- Kubernetes for orchestration
- Advanced analytics with ML
- On-premise GPU evaluation

**Success Metrics**:
- 10K+ paying users
- 100K tests/month
- 99.5% uptime
- 90% subscription renewal

---

## Data Retention & Deletion Policy (ADOPTED RECOMMENDATION)

When user requests data deletion under DPDP Act:

### Immediate Deletion (Within 30 days)
- **User Profile**: Name, email, phone, date of birth, address
- **Parent/Guardian Info**: Parent name, email, phone (for minors)
- **Preferences**: Language settings, notification preferences
- **Sessions**: Active sessions, login history
- **Personal Notes**: Any user-generated content

### Anonymize & Retain (For Analytics)
- **Test Attempts**: 
  - Replace user ID with anonymous UUID
  - Keep: Test scores, question responses, time spent, topic performance
  - Remove: All PII linkages
  - Rationale: Aggregated data improves AI question generation and difficulty calibration
- **Analytics Data**: 
  - Aggregate performance trends (anonymized)
  - Remove individual user tracking

### Retain (Legal/Financial Requirements)
- **Payment Transactions**: 
  - Keep for 7 years (Income Tax Act requirement)
  - Store: Transaction ID, amount, date, subscription type
  - Remove: Name (replace with "Deleted User #12345")
  - Keep: Anonymized user ID for accounting reconciliation
- **Consent Records**: 
  - Keep parental consent timestamps and audit trail (anonymized)
  - Required for DPDP Act compliance audit defense

### Audit Trail
- Log all deletion requests with:
  - Request date, completion date
  - Data categories deleted vs retained
  - Reason for retention (legal requirement)
  - Verification method used

### Automated Deletion
- Accounts inactive for 3+ years: Automatic deletion notice sent
- If no response in 30 days: Proceed with deletion
- Backup tapes: Retain for 90 days, then overwrite

---

## Security Implementation Details

### PCI DSS Compliance (SAQ A)
- **Level**: Self-Assessment Questionnaire A (22 requirements)
- **Scope**: Tokenization-only, no card data storage
- **Requirements**:
  - HTTPS everywhere (TLS 1.3)
  - Payment page hosted by PCI-compliant gateway (iframe/redirect)
  - Quarterly vulnerability scans
  - Annual penetration testing
  - Security awareness training for team
  - Incident response plan documented

### OWASP ASVS Level 2 Implementation
- **Authentication**:
  - Bcrypt password hashing (cost factor 12)
  - JWT with short expiration (15 min access, 7 day refresh)
  - Rate limiting: 5 failed attempts = 15 min lockout
  - Session invalidation on password change
- **Authorization**:
  - Role-based access control (RBAC)
  - API-level permission checks (never client-side only)
  - Subscription tier validation on every request
- **Input Validation**:
  - Whitelist validation on all inputs
  - Parameterized SQL queries (no string concatenation)
  - Content Security Policy (CSP) headers
- **Data Protection**:
  - AES-256 encryption at rest for sensitive data
  - TLS 1.3 for data in transit
  - Database column-level encryption for PII
- **Logging**:
  - All authentication attempts (success/failure)
  - All authorization failures
  - All data access (who accessed what, when)
  - No sensitive data in logs (mask PII)

### Penetration Testing Scope
- **Annual External Pentest**: 
  - OWASP Top 10 vulnerability assessment
  - API security testing
  - Authentication/authorization bypass attempts
  - Payment flow security review
- **Quarterly Internal Scans**:
  - Automated vulnerability scanning (Trivy, OWASP Dependency-Check)
  - Infrastructure misconfiguration detection
- **Bug Bounty**: Consider HackerOne/Bugcrowd in Phase 3

---

### 4. Address Clarification Needs


### 5. Compliance Audit Requirements
Before launch:
- Legal review of privacy policy and terms of service
- DPDP Act compliance audit by legal expert
- OWASP ASVS Level 2 security assessment
- PCI DSS compliance validation
- Accessibility audit (WCAG 2.1 Level AA)
- Appoint Data Protection Officer (DPO)

### 6. Performance Benchmarking
Establish baseline metrics:
- Load testing for 100K concurrent users
- Database query optimization (<50ms p95)
- Mobile app performance on low-end devices
- Offline sync performance with 100+ queued responses
- CDN performance from tier-2/tier-3 Indian cities

### 7. Content Development Strategy
- Partner with subject matter experts for question verification
- Create question review workflow before publishing
- Develop comprehensive explanation templates
- Establish content update pipeline without deployments
