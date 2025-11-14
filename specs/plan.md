# Technical Plan: ExamPrep Platform

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript for type safety
- **API Style**: RESTful API (consider GraphQL for complex queries later)
- **Authentication**: JWT tokens + OAuth 2.0 (Google, Apple)

### Database
- **Primary Database**: PostgreSQL
  - User data, subscriptions, test results, analytics
  - ACID compliance for transactions
- **Cache Layer**: Redis
  - Session management
  - Frequently accessed data (exam patterns, user stats)
- **Object Storage**: AWS S3 or Cloudflare R2
  - Learning resources (videos, PDFs, images)
  - Static assets

### AI/ML Components
- **Question Generation**: Azure OpenAI Service (AOAI)
  - **Model**: GPT-5 (latest generation)
  - **Region**: Central India (data residency compliance)
  - **Cost**: ~$2-5K/month (pay-per-token, pricing TBD)
  - **SDK**: `@azure/openai` for Node.js, `openai` for Python
  - **Authentication**: Azure Key Vault for API keys or Managed Identity
  - Analyze past papers and generate questions with solutions
  - Pre-generate question bank overnight (1000+ questions per exam)
  - Batch processing via Azure Functions for efficiency
- **Pattern Analysis**: Python microservice
  - Topic extraction from questions
  - Difficulty classification
  - Performance analytics
- **Recommendation Engine**: Python with scikit-learn
  - Weak area identification
  - Personalized study paths

### Web Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Context
- **API Client**: Axios with react-query for caching

### Mobile Apps
- **Android**: Kotlin with Jetpack Compose
- **iOS**: Swift with SwiftUI
- **Shared Logic**: Kotlin Multiplatform (optional for code sharing)
- **Offline Support**: SQLite for local test storage

### Payment Integration
- **India**: Razorpay (UPI, Cards, Wallets)
- **International**: Stripe (if expanding)

### Infrastructure
- **Hosting**: AWS or Google Cloud Platform
  - EC2/Compute Engine for API servers
  - RDS for PostgreSQL
  - ElastiCache for Redis
- **CDN**: Cloudflare for content delivery
- **Monitoring**: Sentry (error tracking), Datadog (performance)
- **CI/CD**: GitHub Actions

## System Architecture

### High-Level Architecture
[Web App] ──┐
[Android] ─┼──> [API Gateway] ──> [Load Balancer]
[iOS App] ──┘ │
├─> [Auth Service]
├─> [Test Service]
├─> [Analytics Service]
├─> [Payment Service]
├─> [Content Service]
└─> [AI Service (Python)]
│
└─> [OpenAI API]


### Database Schema (Key Tables)

**users**
- id, email, phone, password_hash, name, created_at, last_login

**exams**
- id, name (IIT-JEE, NEET), description, pattern (JSON), syllabus (JSON), active

**subscriptions**
- id, user_id, plan_type, exam_id (null for unlimited), tests_remaining, expiry_date, auto_renew

**questions**
- id, exam_id, subject, topic, difficulty, question_text, options (JSON), correct_answer, explanation, year, ai_generated

**mock_tests**
- id, user_id, exam_id, questions (JSON array of question_ids), status, started_at, submitted_at

**test_responses**
- id, test_id, question_id, user_answer, time_spent, marked_for_review

**analytics**
- id, user_id, exam_id, topic, total_questions, correct_answers, accuracy, last_updated

**learning_resources**
- id, exam_id, topic, resource_type (video/pdf/note), title, url, duration

### API Endpoints (Key Routes)

**Authentication**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password

**Exams**
- GET /api/exams (list all available exams)
- GET /api/exams/:id (exam details)

**Subscriptions**
- GET /api/subscriptions/plans (list plans)
- POST /api/subscriptions/purchase
- GET /api/subscriptions/my-subscription
- POST /api/subscriptions/cancel

**Mock Tests**
- POST /api/tests/generate (AI generates new test)
- GET /api/tests/:id (get test questions)
- POST /api/tests/:id/submit (submit answers)
- GET /api/tests/:id/results (get results and analysis)
- GET /api/tests/:id/solutions (detailed solutions)
- GET /api/tests/history (user's past tests)

**Analytics**
- GET /api/analytics/dashboard (overall progress)
- GET /api/analytics/weak-areas (topics to focus)
- GET /api/analytics/trends (performance over time)

**Learning Resources**
- GET /api/resources/:topic (get resources for a topic)
- POST /api/resources/:id/mark-complete

**Admin**
- POST /api/admin/questions/import (bulk upload)
- POST /api/admin/exams/create
- PUT /api/admin/exams/:id/update

## Implementation Phases

### Phase 1: MVP (Months 1-2)
- User authentication (email/password)
- Database setup and schema
- Admin: Add IIT-JEE exam structure and question bank (manual)
- Simple mock test generation (random selection, not AI)
- Take test functionality (web only)
- Basic results page
- Single mock exam purchase (Razorpay integration)

### Phase 2: Core Features (Months 3-4)
- AI question generation using GPT-4
- Detailed solution review page
- Topic-wise analytics
- Weak area identification
- Add NEET exam support
- Subscription plans (bundle, unlimited)
- Mobile app development starts

### Phase 3: Personalization (Months 5-6)
- Curated learning resources integration
- Video explanations
- Progress dashboard with charts
- Recommendation engine
- Mobile apps beta release
- Offline test-taking (mobile)

### Phase 4: Polish & Scale (Months 7-8)
- Performance optimization
- Advanced analytics (percentile, peer comparison)
- Push notifications
- Admin dashboard improvements
- Public launch
- Marketing integrations

## Key Technical Decisions

### Why PostgreSQL?
- Complex relational data (users, tests, questions, analytics)
- ACID transactions for payments and subscriptions
- Excellent JSON support for flexible fields (exam patterns, question options)

### Why Next.js for Web?
- SEO-friendly (marketing pages, blogs)
- Server-side rendering for fast initial load
- API routes for BFF (Backend for Frontend) pattern
- Modern React ecosystem

### Why Native Mobile Apps?
- Better performance for test-taking experience
- Offline support with local databases
- Platform-specific UX patterns (iOS vs Android)
- Push notifications

### AI Service Separation
- Python microservice for AI/ML tasks
- Isolates heavy computation from main API
- Easier to scale independently
- Can use specialized ML libraries

### Subscription Access Control
- Middleware checks subscription status on every test-related API call
- Redis cache for fast subscription lookups
- Prevents unauthorized access at API level

## Security Considerations

- Rate limiting: 100 requests/minute per user
- SQL injection prevention: Parameterized queries
- XSS protection: Sanitize user inputs
- CSRF tokens for state-changing operations
- Encrypt sensitive data (passwords, payment info)
- Regular security audits

## Monitoring & DevOps

- Logging: Winston (Node.js) → Elasticsearch
- Error tracking: Sentry for frontend and backend
- Performance: New Relic or Datadog APM
- Uptime monitoring: UptimeRobot
- Automated tests: Jest (unit), Playwright (E2E)
- Deployment: Docker containers, Kubernetes (if scaling)

## Third-Party Services

- Email: SendGrid or AWS SES
- SMS: Twilio or AWS SNS
- Video hosting: YouTube/Vimeo (embedded) or Cloudflare Stream
- Analytics: Mixpanel or Google Analytics
- Customer support: Intercom or Zendesk
