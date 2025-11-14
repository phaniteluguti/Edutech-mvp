# Project Constitution: EduTech

## Vision
EduTech is an AI-powered mock test platform that helps Indian students prepare for competitive exams (IIT-JEE, NEET) through personalized learning, realistic practice tests, and data-driven improvement recommendations. The UI has to be very intutive and Good do not just use blank pages use best graphics possible. Please plan the specs properly based on any existing web site style 

## Non-Negotiable Principles

### Technology Philosophy
- **100% open-source stack**: All core technologies must be free, open-source, and have active community support
- **No vendor lock-in**: Avoid proprietary services; prefer self-hosted solutions
- **Performance first**: Choose technologies proven to handle scale
- **Community-driven**: Select tools with large, active communities (10K+ GitHub stars preferred)
- **Security by design**: Security is not an afterthought; it's built into every component

### Platform Requirements
- Multi-platform support: Web (responsive), Android, iOS
- **Mobile Development**: React Native with Expo (cross-platform)
  - Single codebase for faster time-to-market
  - 70-80% code sharing between platforms
  - Native performance with Hermes engine
  - Option to rewrite performance-critical sections natively if needed
- All platforms must share a single backend API for consistency
- **Offline Support**: Mobile apps must work offline for taking tests
  - SQLite + Watermelon DB for local storage
  - Auto-sync when connection restored
  - Test locked to device where started (prevent sync conflicts)
- API-first architecture enables future integrations

### User Experience Principles
- **Design Quality**: UI must be intuitive with high-quality graphics (no blank pages)
  - Reference platforms: Khan Academy (clean UI), Duolingo (gamification), Brilliant.org (visual progress)
  - Design system: Material Design 3 or custom component library
  - Empty states must use illustrations + helpful text (not blank screens)
  - Loading states use skeleton screens (not spinners)
- Test-taking experience must be distraction-free and performant
- No page reloads during active tests
- Review pages must show question, correct answer, user's answer, explanation, and related learning resources on a single view
- Progress tracking must be visible throughout the user journey
- Accessible design (WCAG 2.1 Level AA compliance)
- **Graphics Strategy**: Custom illustrations for key features, achievement badges, visual feedback

### AI Question Generation Engine (Core Innovation)
- **Primary Goal**: Study previous years' papers and generate realistic AI questions that are likely to appear in upcoming exams
- **Question Database**: 
  - Scrape and store 10+ years of previous exam papers (IIT-JEE, NEET)
  - Maintain structured database with:
    - Question text, options, correct answer, explanation
    - Topic, subtopic, difficulty level, year, exam pattern
    - Question type (MCQ, numerical, assertion-reason, etc.)
    - Weightage and frequency analysis
  - Minimum 5,000 historical questions per exam type before AI generation begins
- **AI Pattern Analysis**:
  - Analyze question patterns: topic distribution, difficulty progression, common themes
  - Identify frequently tested concepts and their variations
  - Study question phrasing styles and complexity levels
  - Detect trending topics and emerging patterns
  - Calculate topic-wise weightage based on last 5 years
- **AI Generation Strategy**: Azure OpenAI Service (GPT-5)
  - **Model**: GPT-5 for question generation
  - **Deployment**: Azure OpenAI Service in Central India region
  - **Input**: Previous years' questions database + syllabus + exam pattern
  - **Prompt Engineering**: 
    - "Generate a question similar to [reference questions] on topic [X]"
    - Include difficulty level, bloom taxonomy level, expected concepts
    - Request explanation in exam board's style
  - **Quality Checks**: 
    - Verify generated questions against historical database (no exact duplicates)
    - Ensure topic distribution matches exam pattern
    - Validate difficulty alignment with exam standards
  - **Cost**: ~$2-5K/month for 100K questions/month generation
  - Pre-generate question bank nightly (min 100 tests per exam type)
  - Maintain fallback pool of 1000+ verified questions per exam type
  - Use Azure Key Vault for API key management
- **Previous Years Database Management**:
  - Auto-scraping pipeline for new exam papers (post-exam release)
  - Manual verification of scraped data by content team
  - Tagging and categorization workflow
  - Version control for question updates/corrections
- **SME Review Process**: 
  - AI-generated questions flagged for review
  - 2 subject matter experts must approve complex questions
  - SME feedback loop improves AI prompts over time
- **Authenticity Guarantee**: Mock papers must align with actual exam patterns and syllabus
- AI recommendations must be based on data-driven analysis of user performance vs historical patterns
- Content quality > content quantity

### Security & Privacy (Non-Negotiable)
- **DPDP Act 2023 compliance**: Parental consent required for users under 18
- **Data localization**: Student data must be stored within India
  - **Primary hosting**: Azure Central India (Mumbai region)
  - All backups must remain within India
  - Cross-region DR: Azure South India only
- User data and performance metrics are confidential
- **Payment information**: Must never be stored locally (tokenization only)
  - Hybrid open-source approach with PCI DSS compliant processor
  - Support UPI, cards, net banking, wallets
  - SAQ A compliance (token-only, no card data storage)
- Test content must be protected from unauthorized access or copying
- Authentication required for all premium features
- Full data ownership (self-hosted infrastructure)
- Encryption at rest and in transit (AES-256, TLS 1.3)

### Technical Standards
- API-first architecture
- **Technology Stack** (100% open-source):
  - Backend: Node.js 20 LTS + TypeScript + Express.js
  - Database: PostgreSQL 16 + Redis 7
  - Frontend: Next.js 15 + React 19 + Tailwind CSS
  - Mobile: React Native with Expo
  - AI/ML: Python 3.12 + FastAPI (microservice)
  - Infrastructure: Azure (Central India region)
- All user-facing features must have error handling and graceful fallbacks
- Database queries must be optimized for performance (<50ms p95)
- Code must be modular and maintainable
- Comprehensive logging for debugging and monitoring
- Containerized deployment (Docker + Docker Compose)
- Infrastructure as Code (Terraform for Azure)
- Automated testing (unit, integration, E2E)

### Business Rules
- **Free tier**: 1 free mock test + 50 sample questions (lifetime)
- **Subscription tiers**:
  - Bundle: 10 tests (₹499/3mo), 25 tests (₹999/6mo), 50 tests (₹1,699/12mo)
  - Unlimited Single Exam: ₹799/month or ₹7,999/year (17% discount)
  - Unlimited All Exams: ₹1,199/month or ₹11,999/year (17% discount)
- Subscription enforcement at API level (never trust client-side checks)
- Content updates (new questions, exams) must not require app redeployment
- **Payment failures**: 7-day grace period with limited access
  - Can review previously taken tests
  - Cannot start new tests
- **Refund policy**:
  - Full refund within 7 days if zero tests attempted
  - No refund after attempting any test (content consumed)
  - Pro-rated refund for unused portion of annual unlimited plans
  - Full refund for technical failures regardless of time
- **Test retakes**: Unlimited retakes, each counts as 1 test credit

### Governance & Compliance

#### Regulatory Compliance
- **Digital Personal Data Protection Act (DPDP Act) 2023** [India]
  - Explicit parental consent for users under 18
  - Data minimization principle
  - Right to access, correction, and deletion
  - Mandatory breach notification within 72 hours
- **GDPR** (if expanding to EU)
- **FERPA** (if expanding to USA)

#### Security Framework Adherence
- **OWASP ASVS Level 2** (Application Security Verification Standard)
- **1EdTech TrustEd Apps Security Practices** (EdTech industry standard)
- Regular penetration testing (annually)
- Vulnerability scanning (continuous)

#### Data Governance
1. **Data Minimization**: Collect only essential data for service delivery
2. **Purpose Limitation**: Use data only for stated educational purposes
3. **Storage Limitation**: Retain data only as long as necessary (default: 3 years after account closure)
4. **Transparency**: Clear, accessible privacy policy in English and Hindi
5. **Accountability**: Designated Data Protection Officer (DPO)

#### Security Certifications (Roadmap)
- **Year 1**: Vulnerability assessments, penetration testing
- **Year 2**: SOC 2 Type 2, ISO 27001
- **Year 3**: PCI DSS Level 1 (if processing >6M transactions/year)

### Development Principles
- **Documentation**: Code without documentation doesn't exist
  - API docs: OpenAPI/Swagger for all endpoints
  - Code comments: JSDoc/TypeScript for all functions
  - Architecture: C4 model diagrams, ADRs for major decisions
  - Developer guide: Setup instructions, coding standards, contribution guide
- **Testing**: Minimum 80% code coverage
  - Unit tests: Jest for all business logic
  - Integration tests: API endpoint testing
  - E2E tests: Playwright for critical user journeys
- **Code Review**: All code must pass 2+ peer reviews
- **Security Review**: Auth and payment code requires senior developer approval
- **Monitoring**: If it's not monitored, it will break
  - Prometheus + Grafana + Loki stack
  - Alert rules: Critical (PagerDuty), Warning (Slack)
  - Public status page for transparency
- **Backups**: 3-2-1 rule (3 copies, 2 different media, 1 offsite)
  - Copy 1: Azure Database auto-backup (35 days)
  - Copy 2: Nightly dumps to Azure Blob Storage (90 days)
  - Copy 3: Cross-region GRS replication (South India)
  - Quarterly restoration testing

### Operational Principles
- **Uptime**: 99.5% availability target
- **Response Time**: API <200ms (p95), page load <1.5s
- **Scalability**: Design for 100K+ concurrent users from day one
- **Support**: Response to critical issues within 15 minutes
- **Transparency**: Public status page, incident post-mortems

### Ethical Principles
- No dark patterns (e.g., hiding cancel subscription button)
- No predatory pricing (targeting vulnerable students)
- No data selling to third parties
- Student welfare over profits
- Accessible to all (support for low-bandwidth connections)
