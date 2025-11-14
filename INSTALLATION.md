# 🚀 Installation & First Run Guide

**Status**: Clean slate created ✅  
**Next Step**: Install dependencies and verify everything works

---

## ⚡ Quick Start (Recommended)

### Option 1: Docker Compose (Easiest)

```powershell
# 1. Build all services (first time only)
docker-compose build

# 2. Start all services
docker-compose up -d

# 3. Initialize database
docker exec -it edutech-backend npm run prisma:migrate

# 4. Check services are running
docker-compose ps

# 5. View logs
docker-compose logs -f

# 6. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/health
# AI Service: http://localhost:8001/health
# MinIO Console: http://localhost:9001 (user: minio, pass: miniopass123)
```

**To stop all services:**
```powershell
docker-compose down
```

---

## 🛠️ Option 2: Manual Setup (Development)

### Step 1: Install Backend Dependencies

```powershell
cd backend

# Install Node.js dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Create .env file
Copy-Item .env.example .env

# Edit .env and set:
# - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# - DATABASE_URL=postgresql://edutech:edutech@localhost:5432/edutech
# - REDIS_URL=redis://localhost:6379

# Start PostgreSQL and Redis (use Docker)
# In a separate terminal at project root:
docker-compose up postgres redis -d

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev

# Server should start on http://localhost:4000
# Test: curl http://localhost:4000/health
```

### Step 2: Install Frontend Dependencies

```powershell
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Start development server
npm run dev

# Frontend should start on http://localhost:3000
```

### Step 3: Install AI Service Dependencies

```powershell
# Open new terminal
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env and set Azure OpenAI credentials (optional for now)

# Start AI service
python main.py

# Service should start on http://localhost:8001
# Test: curl http://localhost:8001/health
```

### Step 4: Install Mobile Dependencies (Optional)

```powershell
# Open new terminal
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Choose platform:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app
```

---

## ✅ Verification Checklist

After installation, verify:

### 1. Backend Health Check
```powershell
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-14T..."}
```

### 2. AI Service Health Check
```powershell
curl http://localhost:8001/health

# Expected response:
# {"status":"ok","service":"ai-service","azure_openai_configured":false}
```

### 3. Database Connection
```powershell
cd backend
npm run prisma:studio

# Opens Prisma Studio on http://localhost:5555
# You should see 9 tables:
# - PreviousYearQuestion
# - User
# - Subscription
# - Transaction
# - Exam
# - MockTest
# - Question
# - TestAttempt
# - WeakArea
```

### 4. Frontend Loading
Open http://localhost:3000 in browser - should see Next.js default page

### 5. Docker Services (if using Docker Compose)
```powershell
docker-compose ps

# All services should show "Up" status:
# - edutech-postgres
# - edutech-redis
# - edutech-minio
# - edutech-ai
# - edutech-backend
# - edutech-frontend
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"

**Solution**: Install backend dependencies
```powershell
cd backend
npm install
```

### Error: "prisma:generate" not working

**Solution**: Ensure Prisma is installed
```powershell
cd backend
npm install prisma @prisma/client --save-dev
npm run prisma:generate
```

### Error: "Python module not found"

**Solution**: Install Python dependencies in virtual environment
```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Error: Docker build fails

**Solution**: Ensure Docker Desktop is running
```powershell
# Check Docker status
docker --version
docker-compose --version

# Restart Docker Desktop if needed
```

### Error: Port already in use

**Solution**: Check what's using the port
```powershell
# Check port 4000 (backend)
netstat -ano | findstr :4000

# Kill process if needed
taskkill /PID <PID> /F

# Or use different port in .env:
# PORT=4001
```

### Error: Database connection failed

**Solution**: Ensure PostgreSQL is running
```powershell
# If using Docker
docker-compose up postgres -d

# Check logs
docker-compose logs postgres

# Verify connection
docker exec -it edutech-postgres psql -U edutech -d edutech
```

---

## 📦 What Gets Installed

### Backend (`backend/node_modules`)
- **Runtime**: Express.js, Socket.IO
- **Database**: Prisma Client, Prisma ORM
- **Auth**: JWT, bcrypt
- **Cache**: ioredis (Redis client)
- **Logging**: Winston, Morgan
- **Security**: Helmet, CORS
- **Dev**: TypeScript, ts-node-dev, Jest, ESLint, Prettier

**Total**: ~500 MB

### Frontend (`frontend/node_modules`)
- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Real-time**: Socket.IO client
- **Dev**: TypeScript, ESLint

**Total**: ~400 MB

### AI Service (`ai-service/venv`)
- **Framework**: FastAPI, Uvicorn
- **AI**: OpenAI SDK (Azure)
- **PDF**: pdfplumber, pytesseract, Pillow
- **Data**: Pandas, NumPy
- **Cache**: Redis client
- **Dev**: pytest

**Total**: ~300 MB

### Mobile (`mobile/node_modules`)
- **Framework**: Expo SDK 51, React Native 0.74
- **UI**: React Native Paper
- **Offline**: Watermelon DB
- **Navigation**: React Navigation
- **State**: Zustand

**Total**: ~600 MB

**Grand Total Disk Space**: ~1.8 GB for all node_modules + venv

---

## 🎯 Next Steps After Installation

### 1. Verify All Services Running

```powershell
# Check all health endpoints
curl http://localhost:4000/health  # Backend
curl http://localhost:8001/health  # AI Service
# Open http://localhost:3000        # Frontend
```

### 2. Explore Prisma Studio

```powershell
cd backend
npm run prisma:studio
# Opens database GUI on http://localhost:5555
```

### 3. Start Implementing Features

Refer to `specs/master/tasks.md` and start with:
- **T001-T015**: Setup tasks (most already done!)
- **T016-T063**: Foundational infrastructure
- **T064-T087**: Previous Years DB + AI Engine ⭐

### 4. Run Tests (when implemented)

```powershell
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI service tests
cd ai-service
pytest
```

---

## 🔄 Daily Development Workflow

### Using Docker Compose (Recommended)

```powershell
# Morning: Start all services
docker-compose up -d

# Work on code (changes auto-reload with volumes)

# Check logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f ai-service # AI service logs
docker-compose logs -f frontend   # Frontend logs

# Evening: Stop services
docker-compose down
```

### Using Manual Setup

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: AI Service
cd ai-service
.\venv\Scripts\Activate.ps1
python main.py

# Terminal 4: Mobile (optional)
cd mobile
npm start
```

---

## 📝 Environment Variables Summary

### Backend (`.env`)
```env
DATABASE_URL=postgresql://edutech:edutech@localhost:5432/edutech
REDIS_URL=redis://localhost:6379
AI_SERVICE_URL=http://localhost:8001
JWT_SECRET=<generate-random-64-char-hex>
PORT=4000
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### AI Service (`.env`)
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:3000
```

---

## ✅ Ready to Code!

Once installation is complete and all health checks pass, you're ready to start implementing features from `specs/master/tasks.md`! 🚀

**Current Progress**: Setup complete, dependencies ready to install, clean slate aligned with specification.
