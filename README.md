# EduTech AI Platform - MVP

> AI-powered exam preparation platform that analyzes 10+ years of previous papers to generate realistic mock tests.

## 🚀 Core Innovation

The platform's **differentiator** is an AI engine that:
- Scrapes and stores **5,000+ previous year questions** per exam
- Analyzes **patterns** (topic frequency, difficulty, question styles)
- **Generates realistic questions** using Azure OpenAI GPT-4 with historical context
- Validates uniqueness (<90% similarity) and ensures SME review

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4 + TypeScript 5.3
- **ORM**: Prisma 5 (PostgreSQL 16)
- **Cache**: Redis 7
- **Real-time**: Socket.IO

### Frontend
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts

### Mobile
- **Framework**: React Native + Expo SDK 51
- **UI**: React Native Paper (Material Design 3)
- **Offline**: Watermelon DB + SQLite

### AI Service
- **Runtime**: Python 3.12
- **Framework**: FastAPI
- **AI**: Azure OpenAI (GPT-4)
- **Scraping**: pdfplumber, pytesseract

### Infrastructure
- **Database**: Azure PostgreSQL 16 (Central India)
- **Cache**: Azure Redis 7
- **Storage**: Azure Blob Storage (GRS)
- **Container**: Docker + Docker Compose
- **IaC**: Terraform

## 🏗️ Project Structure

```
EdtTech-mvp/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma # 9 entities including PreviousYearQuestion
│   └── tests/
├── frontend/             # Next.js 15 web app
│   ├── app/
│   ├── components/
│   └── lib/
├── mobile/               # React Native app
│   ├── app/
│   ├── components/
│   └── services/
├── ai-service/           # Python FastAPI service
│   ├── app/
│   ├── services/         # Scraping, generation, pattern analysis
│   └── models/
├── infrastructure/
│   ├── terraform/        # Azure IaC
│   └── monitoring/       # Prometheus, Grafana
└── specs/                # Complete documentation
    └── master/
        ├── spec.md       # Feature specification
        ├── plan.md       # Implementation plan
        ├── tasks.md      # 265 tasks breakdown
        ├── data-model.md # Database schema
        ├── research.md   # Technology decisions
        ├── quickstart.md # Developer guide
        └── contracts/    # OpenAPI specs (50+ endpoints)
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js**: 20 LTS or higher
- **Python**: 3.12 or higher
- **Docker Desktop**: Latest version
- **Git**: Latest version

### 1. Clone & Setup

```powershell
git clone <repository-url>
cd EdtTech-mvp

# Copy environment files
Copy-Item backend\.env.example backend\.env
Copy-Item ai-service\.env.example ai-service\.env
Copy-Item .env.example .env
```

### 2. Configure Environment

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://edutech:edutech@localhost:5432/edutech
REDIS_URL=redis://localhost:6379
JWT_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
AI_SERVICE_URL=http://localhost:8001
```

Edit `ai-service/.env`:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

### 3. Start with Docker Compose

```powershell
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Services will be available at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- AI Service: http://localhost:8001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO Console: http://localhost:9001

### 4. Initialize Database

```powershell
# Enter backend container
docker exec -it edutech-backend sh

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 5. Verify Setup

```powershell
# Health checks
curl http://localhost:4000/health
curl http://localhost:8001/health

# View Prisma Studio (database GUI)
cd backend
npm run prisma:studio
# Opens on http://localhost:5555
```

## 📱 Mobile Development

```powershell
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🧪 Testing

```powershell
# Backend tests
cd backend
npm test
npm run test:watch

# Frontend tests (to be added)
cd frontend
npm test
```

## 📚 Database Schema

The platform uses **9 entities**:

1. **PreviousYearQuestion** ⭐ *Core Innovation*
   - 10+ years of historical exam questions
   - Pattern analysis metadata
   - AI usage tracking

2. **User** (DPDP compliance, parental consent)
3. **Subscription** (Free, Bundle, Unlimited tiers)
4. **Transaction** (Razorpay integration)
5. **Exam** (JEE, NEET configurations)
6. **MockTest** (AI-generated tests)
7. **Question** (Test questions with AI metadata)
8. **TestAttempt** (Real-time sync, optimistic locking)
9. **WeakArea** (Analytics and recommendations)

See `backend/prisma/schema.prisma` for complete schema.

## 🔑 Key Features

### Phase 1: Authentication & DPDP Compliance ✅ Planned
- Email/SMS verification
- Parental consent for minors (<18 years)
- JWT-based sessions

### Phase 2: Previous Years Database ⭐ Core Innovation
- Scrape official exam papers (pdfplumber)
- Store 5,000+ questions with metadata
- Pattern analysis dashboard

### Phase 3: AI Question Generation ⭐ Core Innovation
- Use 5-10 similar previous questions as context
- Generate with Azure OpenAI GPT-4
- Similarity checking (<90%)
- SME review queue

### Phase 4: Test Taking
- Real-time sync (Socket.IO)
- Offline support (Watermelon DB on mobile)
- Server-authoritative timing
- Instant evaluation

### Phase 5: Analytics & Insights
- Weak area detection
- Progress tracking
- Percentile calculation
- Personalized recommendations

### Phase 6: Payments (Razorpay)
- Free tier: 5 tests/month
- Bundle tiers: ₹499-₹999 (limited tests)
- Unlimited: ₹1999/year

## 📖 Documentation

- **Complete Spec**: `specs/master/spec.md` (294 lines)
- **Implementation Plan**: `specs/master/plan.md` (498 lines)
- **Task Breakdown**: `specs/master/tasks.md` (265 tasks)
- **API Contracts**: `specs/master/contracts/` (50+ endpoints)
- **Developer Guide**: `specs/master/quickstart.md`

## 🎯 MVP Scope

**177 tasks** to functional MVP:
- ✅ Phase 1: Setup (15 tasks)
- ✅ Phase 2: Foundational (48 tasks)
- ⭐ Phase 3: Previous Years DB + AI Engine (24 tasks)
- ✅ Phase 4: Authentication (38 tasks)
- ✅ Phase 5: Exam Management (14 tasks)
- ✅ Phase 6: Test Taking (38 tasks)

**MVP Delivers**:
- Students register/login (DPDP compliant)
- Platform scrapes 5,000+ previous years questions
- AI generates realistic questions
- Students take AI-generated mock tests
- Instant scoring and results

## 🔒 Security & Compliance

- **DPDP Act 2023**: Parental consent, data localization (India)
- **OWASP ASVS Level 2**: Planned security controls
- **PCI DSS SAQ A**: Razorpay tokenization (no card storage)
- **Encryption**: AES-256 at rest, TLS 1.3 in transit

## 🌍 Deployment (Azure Central India)

```powershell
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply
```

## 🤝 Contributing

See `specs/master/tasks.md` for available tasks. Each task has:
- Clear description
- Dependencies
- Acceptance criteria
- [P] marker for parallel work

## 📝 License

Proprietary - All rights reserved

---

**Built with ❤️ for Indian students preparing for competitive exams**
