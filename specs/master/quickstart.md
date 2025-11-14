# EduTech Platform - Developer Quickstart

Get the EduTech AI-powered mock test platform running locally in under 10 minutes.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: 20 LTS or higher ([download](https://nodejs.org/))
- **Python**: 3.12 or higher ([download](https://www.python.org/downloads/))
- **Docker Desktop**: Latest version ([download](https://www.docker.com/products/docker-desktop/))
- **Git**: Latest version
- **Azure CLI**: For cloud deployments (optional for local dev) ([install](https://learn.microsoft.com/cli/azure/install-azure-cli))

Verify installations:
```powershell
node --version  # Should be >= v20.0.0
python --version  # Should be >= 3.12.0
docker --version  # Should be >= 24.0.0
```

## Quick Setup (5 Minutes)

### 1. Clone Repository

```powershell
git clone https://github.com/your-org/edutech-mvp.git
cd edutech-mvp
```

### 2. Install Dependencies

```powershell
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Mobile (optional for local dev)
cd mobile
npm install
cd ..

# AI Service
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` in each service directory:

```powershell
cp backend\.env.example backend\.env
cp frontend\.env.example frontend\.env
cp ai-service\.env.example ai-service\.env
```

**Edit `backend/.env`**:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edutech_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Razorpay (test mode)
RAZORPAY_KEY_ID="rzp_test_xxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxx"

# Azure OpenAI (optional for local dev - uses mock)
AZURE_OPENAI_ENDPOINT="https://your-instance.openai.azure.com/"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT="gpt-5"
```

**Edit `frontend/.env`**:
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/v1"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxxxxx"
```

**Edit `ai-service/.env`**:
```env
AZURE_OPENAI_ENDPOINT="https://your-instance.openai.azure.com/"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT="gpt-5"
MOCK_MODE="true"  # Use mock responses for local dev without Azure OpenAI
```

### 4. Start Database & Redis

Using Docker Compose:

```powershell
docker-compose up -d postgres redis
```

Wait 10 seconds for services to initialize.

### 5. Run Database Migrations

```powershell
cd backend
npx prisma migrate deploy
npx prisma db seed  # Seed initial data (exams, admin user)
cd ..
```

**Default Admin Credentials**:
- Email: `admin@edutech.com`
- Password: `admin123` (change immediately!)

### 6. Start Services

Open 4 terminal windows:

**Terminal 1 - Backend API**:
```powershell
cd backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend Web**:
```powershell
cd frontend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3 - AI Service**:
```powershell
cd ai-service
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

**Terminal 4 - Mobile (optional)**:
```powershell
cd mobile
npx expo start
# Scan QR code with Expo Go app
```

### 7. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API Docs**: http://localhost:3000/api-docs (Swagger UI)
- **AI Service Docs**: http://localhost:8000/docs (FastAPI auto-docs)

## Project Structure

```
edutech-mvp/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API routes (auth, tests, analytics, subscriptions)
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, error handling
│   │   └── prisma/         # Database schema & migrations
│   ├── tests/              # Jest unit & integration tests
│   └── package.json
├── frontend/               # Next.js 15 + React 19
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities, API client
│   └── public/             # Static assets
├── mobile/                 # React Native + Expo
│   ├── src/
│   │   ├── screens/        # Mobile screens
│   │   ├── components/     # React Native components
│   │   ├── navigation/     # React Navigation
│   │   └── db/             # Watermelon DB (offline storage)
│   └── app.json
├── ai-service/             # Python + FastAPI
│   ├── main.py             # FastAPI app
│   ├── services/
│   │   └── question_generator.py  # Azure OpenAI integration
│   └── requirements.txt
├── infrastructure/         # Terraform IaC
│   ├── azure/              # Azure resources (App Service, PostgreSQL, Redis)
│   └── docker-compose.yml  # Local development stack
└── specs/                  # SpecKit documentation
    └── master/
        ├── spec.md         # Feature specification
        ├── plan.md         # Implementation plan
        ├── data-model.md   # Database schema
        └── contracts/      # OpenAPI specs
```

## Common Tasks

### Scrape Previous Years Papers (AI Service)

```powershell
cd ai-service
.\venv\Scripts\Activate.ps1

# Scrape a single exam paper PDF
python scripts/scrape_paper.py --url "https://example.com/jee-2024.pdf" --exam IIT_JEE --year 2024

# Batch scrape all papers from a directory
python scripts/batch_scrape.py --input-dir "./papers" --exam IIT_JEE

# Verify scraped questions (manual review queue)
python scripts/verify_questions.py --status PENDING_VERIFICATION
```

### Generate AI Questions

```powershell
cd ai-service
.\venv\Scripts\Activate.ps1

# Generate questions for a specific topic (using previous years as context)
python scripts/generate_questions.py --topic "Mechanics" --difficulty MEDIUM --count 10

# Run nightly batch generation (simulates Azure Function locally)
python scripts/batch_generate.py --exam IIT_JEE --output "./generated"

# Analyze previous years patterns
python scripts/analyze_patterns.py --exam IIT_JEE --years 2020-2024
```

### Run Tests

```powershell
# Backend
cd backend
npm test                  # All tests
npm test -- --watch      # Watch mode
npm run test:coverage    # Coverage report

# Frontend
cd frontend
npm test

# AI Service
cd ai-service
.\venv\Scripts\Activate.ps1
pytest
```

### Database Operations

```powershell
cd backend

# Generate migration after schema changes
npx prisma migrate dev --name add_new_field

# Reset database (⚠️ destroys all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
# Opens http://localhost:5555
```

### Lint & Format

```powershell
# Backend/Frontend
npm run lint
npm run format

# AI Service
cd ai-service
.\venv\Scripts\Activate.ps1
black .
flake8 .
```

### Build for Production

```powershell
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
npm start  # Serves production build

# Mobile
cd mobile
eas build --platform android  # Requires Expo Application Services
eas build --platform ios
```

## API Testing

### Using cURL

```powershell
# Register user
curl -X POST http://localhost:3000/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@example.com\",
    \"password\": \"Test@123\",
    \"name\": \"Test User\",
    \"targetExam\": \"IIT_JEE\",
    \"consentVersion\": \"v1.0.0\"
  }'

# Login
$token = (curl -X POST http://localhost:3000/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"test@example.com\", \"password\": \"Test@123\"}' | ConvertFrom-Json).token

# List tests
curl http://localhost:3000/v1/tests `
  -H "Authorization: Bearer $token"
```

### Using Swagger UI

1. Open http://localhost:3000/api-docs
2. Click "Authorize" button
3. Enter JWT token (from login response)
4. Try API endpoints interactively

## Troubleshooting

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Error

```powershell
# Check Docker containers are running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Error

```powershell
# Restart Redis
docker-compose restart redis

# Test connection
redis-cli -h localhost -p 6379 ping
# Should return: PONG
```

### Prisma Migration Errors

```powershell
# Reset database and re-run migrations
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

### Module Not Found

```powershell
# Clear node_modules and reinstall
rm -r node_modules, package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

## Development Workflow

### 1. Create Feature Branch

```powershell
git checkout -b feature/add-new-endpoint
```

### 2. Make Changes

- Update code in `backend/`, `frontend/`, etc.
- Add tests for new functionality
- Update API contracts in `specs/master/contracts/` if needed

### 3. Run Tests

```powershell
npm test
```

### 4. Commit & Push

```powershell
git add .
git commit -m "feat: add new endpoint for XYZ"
git push origin feature/add-new-endpoint
```

### 5. Create Pull Request

- Open PR on GitHub
- CI/CD runs tests automatically
- Request code review
- Merge after approval

## Production Deployment

### Azure Setup

```powershell
# Login to Azure
az login

# Create resource group
az group create --name edutech-prod --location centralindia

# Deploy infrastructure
cd infrastructure/azure
terraform init
terraform plan
terraform apply
```

### Environment Variables (Azure)

Set in Azure App Service Configuration:

- `DATABASE_URL`: Azure PostgreSQL connection string
- `REDIS_URL`: Azure Cache for Redis connection string
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Stored in Azure Key Vault
- `JWT_SECRET`: Random 64-char string (Key Vault)
- `RAZORPAY_KEY_ID`: Production key
- `RAZORPAY_KEY_SECRET`: Production secret (Key Vault)

### Deploy Backend

```powershell
cd backend

# Build Docker image
docker build -t edutech-backend:latest .

# Push to Azure Container Registry
az acr login --name eductechacr
docker tag edutech-backend:latest eductechacr.azurecr.io/backend:latest
docker push eductechacr.azurecr.io/backend:latest

# Deploy to App Service
az webapp restart --name edutech-backend --resource-group edutech-prod
```

### Deploy Frontend

```powershell
cd frontend

# Build Next.js
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp deploy --app-name edutech-frontend --resource-group edutech-prod
```

## Monitoring & Logs

### Local Development

```powershell
# View backend logs
cd backend
npm run dev  # Logs to console

# View Docker logs
docker-compose logs -f postgres redis
```

### Production (Azure)

```powershell
# Stream backend logs
az webapp log tail --name edutech-backend --resource-group edutech-prod

# Download logs
az webapp log download --name edutech-backend --resource-group edutech-prod
```

## Additional Resources

- **API Documentation**: `/specs/master/contracts/`
- **Database Schema**: `/specs/master/data-model.md`
- **Feature Specification**: `/specs/master/spec.md`
- **Implementation Plan**: `/specs/master/plan.md`
- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Azure Docs**: https://learn.microsoft.com/azure/

## Getting Help

- **Slack**: #edutech-dev (internal team channel)
- **Email**: dev@edutech.com
- **GitHub Issues**: https://github.com/your-org/edutech-mvp/issues

---

**Happy Coding! 🚀**
