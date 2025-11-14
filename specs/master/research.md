# Technology Research & Decisions

**Date**: 2025-11-14  
**Feature**: EduTech Platform MVP  
**Purpose**: Document all technology decisions, patterns, and best practices for implementation

## Research Tasks Completed

### 1. Real-time Synchronization with Operational Transforms

**Decision**: Use WebSocket (Socket.IO) with custom conflict resolution for test state sync

**Rationale**:
- Operational Transforms (OT) too complex for simple answer selection updates
- Custom last-write-wins with timestamp resolution sufficient for test-taking
- Socket.IO provides automatic reconnection, fallback to long-polling
- Server-authoritative timer prevents manipulation

**Alternatives Considered**:
- **ShareDB/Yjs**: Full OT libraries - rejected due to overhead for simple updates
- **Server-Sent Events**: One-way only - rejected, need bi-directional sync
- **Polling**: High latency, inefficient - rejected for poor UX

**Implementation Approach**:
```typescript
// Conflict resolution strategy
interface TestUpdate {
  questionId: string;
  selectedOption: string;
  timestamp: number; // Server timestamp
  deviceId: string;
}

// Server broadcasts to all connected clients
// Client applies update if timestamp > local timestamp
// Timer always from server, never from client
```

**References**:
- Socket.IO docs: https://socket.io/docs/v4/
- Conflict-free data types: https://crdt.tech/

---

### 2. Mobile Offline-First Architecture

**Decision**: Watermelon DB for offline storage with custom sync engine

**Rationale**:
- Built for React Native, optimized for performance (lazy loading)
- Observable queries trigger UI updates automatically
- SQLite backend proven reliable for offline data
- Custom sync gives control over conflict resolution

**Alternatives Considered**:
- **Realm**: Vendor lock-in risk (MongoDB), heavier than needed
- **AsyncStorage**: Key-value store insufficient for relational data
- **Raw SQLite**: Too low-level, manual query management overhead

**Implementation Approach**:
```javascript
// Watermelon DB Schema
@model('test_attempts')
class TestAttempt extends Model {
  @field('test_id') testId
  @field('user_id') userId
  @json('responses', sanitizeResponses) responses
  @field('sync_status') syncStatus // pending, syncing, synced, error
  @date('started_at') startedAt
  @date('synced_at') syncedAt
}

// Sync strategy
- Download test on "Start Test" (questions, images)
- Auto-save responses every 30 seconds locally
- Upload on submit or when connection restored
- Mark test as "locked to device" server-side
```

**References**:
- Watermelon DB: https://watermelondb.dev/docs
- React Native offline patterns: https://github.com/rgommezz/react-native-offline

---

### 3. Azure OpenAI Integration Patterns with Previous Years Analysis

**Decision**: Batch generation with Azure Functions, pre-populate question bank nightly using previous years' papers as AI training context

**Rationale**:
- GPT-5 pricing TBD, batch processing reduces costs vs on-demand
- Azure Functions serverless scales automatically
- Pre-generation ensures instant test delivery
- Fallback bank (1000+ verified questions from previous years) handles API failures
- Previous years' questions provide authentic exam patterns for AI to learn from

**Alternatives Considered**:
- **On-demand generation**: High latency, unpredictable costs - rejected
- **Self-hosted LLM**: Mistral/Llama lack quality of GPT-5 - rejected per clarifications
- **Container Jobs**: Valid alternative, chose Functions for simpler management

**Previous Years Paper Database Strategy**:
```typescript
// Step 1: Scrape and store historical papers
interface PreviousYearQuestion {
  examType: 'IIT_JEE' | 'NEET';
  year: number;
  section: string;
  questionNumber: number;
  text: string;
  options?: string[];
  correctAnswer: string | number | string[];
  officialSolution: string;
  topic: string;
  subtopic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  bloomLevel: string;
  conceptsTested: string[];
  marks: number;
  frequency: number; // How many times this concept tested
}

// Step 2: Pattern analysis
function analyzeExamPatterns(questions: PreviousYearQuestion[]) {
  return {
    topicDistribution: calculateTopicWeightage(questions),
    difficultyProgression: analyzeDifficultyPattern(questions),
    frequentConcepts: identifyFrequentConcepts(questions),
    questionStyles: extractPhrasingPatterns(questions),
    trendingTopics: detectTrends(questions, lastNYears = 3)
  };
}
```

**Implementation Approach**:
```python
# Azure Function (Python)
# Trigger: Timer (23:00 IST daily)
# Input: Previous years questions database + Exam syllabus
# Output: 100 new questions per exam to Blob Storage

from azure.ai.openai import AzureOpenAI
from azure.identity import DefaultAzureCredential
import random

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_deployment="gpt-5",
    credential=DefaultAzureCredential()
)

def generate_question_with_context(topic: str, difficulty: str, exam_type: str):
    # Fetch 5-10 similar previous year questions as examples
    previous_questions = fetch_similar_questions(
        topic=topic,
        difficulty=difficulty, 
        exam_type=exam_type,
        limit=5
    )
    
    # Build context-rich prompt
    examples = "\n".join([
        f"Example {i+1} (Year {q.year}): {q.text}\nAnswer: {q.correctAnswer}\nExplanation: {q.officialSolution}"
        for i, q in enumerate(previous_questions)
    ])
    
    system_prompt = f"""You are an expert in creating {exam_type} questions.
Analyze these previous year questions from actual exams:

{examples}

Generate a NEW question on topic '{topic}' with difficulty '{difficulty}' that:
1. Matches the style and complexity of the examples above
2. Tests similar concepts but with different numbers/scenarios
3. Is likely to appear in upcoming exams based on pattern analysis
4. Includes 4 options (one correct), detailed explanation, and common mistakes

Output format (JSON):
{{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctOption": 1,
  "explanation": "Step-by-step solution...",
  "conceptsTested": ["concept1", "concept2"],
  "commonMistakes": ["mistake1", "mistake2"],
  "similarityToYear": 2023,
  "confidenceScore": 0.95
}}"""
    
    response = client.chat.completions.create(
        model="gpt-5",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate a {difficulty} question on {topic}"}
        ],
        temperature=0.7,  # Balance creativity and consistency
        response_format={"type": "json_object"}
    )
    
    generated = json.loads(response.choices[0].message.content)
    
    # Quality validation
    if validate_question_quality(generated, previous_questions):
        # Mark previous questions as used in AI generation
        for q in previous_questions:
            increment_ai_usage_count(q.id)
        
        return generated
    else:
        # Retry with different examples or fall back to verified pool
        return None

def validate_question_quality(generated, reference_questions):
    """Ensure generated question meets quality standards"""
    # Check similarity (should be <90% to any reference)
    for ref in reference_questions:
        similarity = calculate_similarity(generated['question'], ref.text)
        if similarity > 0.9:
            return False  # Too similar, reject
    
    # Check all required fields present
    required = ['question', 'options', 'correctOption', 'explanation']
    if not all(k in generated for k in required):
        return False
    
    # Check explanation quality (min length, includes steps)
    if len(generated['explanation']) < 50:
        return False
    
    return True

# Batch generation workflow
def nightly_question_generation():
    exam_types = ['IIT_JEE', 'NEET']
    
    for exam in exam_types:
        # Analyze current question bank patterns
        patterns = analyze_exam_patterns(exam, last_n_years=3)
        
        # Generate questions matching pattern distribution
        for topic, weightage in patterns.topicDistribution.items():
            questions_needed = int(100 * weightage)  # 100 questions total
            
            for difficulty in ['EASY', 'MEDIUM', 'HARD']:
                count = calculate_difficulty_split(questions_needed, difficulty)
                
                for _ in range(count):
                    question = generate_question_with_context(
                        topic=topic,
                        difficulty=difficulty,
                        exam_type=exam
                    )
                    
                    if question:
                        save_to_database(question, status='PENDING_SME_REVIEW')
                    else:
                        # Log failure, use fallback question
                        fallback_question = get_verified_fallback(topic, difficulty)
                        save_to_database(fallback_question, status='VERIFIED')
```

**Cost Management**:
- Budget alerts at $4K/month (80% of $5K max)
- Monitor token usage via Azure Monitor
- Cache frequently requested questions
- Track AI generation success rate (target >90%)
- Optimize prompts to reduce token count

**Previous Years Database Scraping Pipeline**:
```python
# Separate service for scraping new exam papers
import pdfplumber
import pytesseract
from PIL import Image

def scrape_exam_paper(pdf_url: str, exam_type: str, year: int):
    """Extract questions from official exam PDF"""
    questions = []
    
    with pdfplumber.open(pdf_url) as pdf:
        for page in pdf.pages:
            # Extract text
            text = page.extract_text()
            
            # Extract images (for diagrams)
            images = page.images
            
            # Parse questions (regex patterns for question numbers)
            parsed = parse_questions_from_text(text, exam_type)
            
            questions.extend(parsed)
    
    # Manual verification queue
    for q in questions:
        q['verificationStatus'] = 'PENDING_VERIFICATION'
        q['scrapeSource'] = pdf_url
        q['scrapedAt'] = datetime.now()
    
    return questions

# Content team workflow
def verify_scraped_question(question_id: str, verifier_user_id: str):
    """Content team manually verifies scraped questions"""
    question = db.get_question(question_id)
    
    # Verify: correct answer, proper formatting, topic tagging
    question['verifiedBy'] = verifier_user_id
    question['verifiedAt'] = datetime.now()
    question['verificationStatus'] = 'VERIFIED'
    
    db.save_question(question)
    
    # Now available for AI generation as reference
```

**References**:
- Azure OpenAI SDK: https://learn.microsoft.com/azure/ai-services/openai/
- Azure Functions Python: https://learn.microsoft.com/azure/azure-functions/functions-reference-python
- Pattern matching research: Educational data mining techniques

---

### 4. Payment Gateway Integration (Razorpay/Cashfree)

**Decision**: Razorpay as primary (Cashfree as backup)

**Rationale**:
- Better developer experience (SDK, docs, testing sandbox)
- Supports all required methods (UPI, cards, wallets, net banking)
- PCI DSS Level 1 certified
- Automatic retries on payment failures

**Alternatives Considered**:
- **Cashfree**: Comparable, keep as backup option
- **PayU**: Lower market share, less reliable
- **Stripe**: International focus, UPI support limited

**Implementation Approach**:
```typescript
// Backend: Create order
const order = await razorpay.orders.create({
  amount: 49900, // ₹499 in paise
  currency: 'INR',
  receipt: `receipt_${subscriptionId}`,
  payment_capture: 1 // Auto-capture
});

// Frontend: Checkout
const options = {
  key: RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: 'INR',
  name: 'EduTech',
  description: 'Bundle 10 Tests',
  order_id: order.id,
  prefill: {
    email: user.email,
    contact: user.phone
  },
  theme: { color: '#1976D2' },
  handler: async (response) => {
    // Verify signature server-side
    await verifyPayment(response);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

**PCI DSS Compliance (SAQ A)**:
- No card data stored (Razorpay handles)
- HTTPS everywhere
- Quarterly vulnerability scans
- Document security policies

**References**:
- Razorpay Docs: https://razorpay.com/docs/
- PCI DSS SAQ A: https://www.pcisecuritystandards.org/documents/SAQ_A_v4.pdf

---

### 5. Material Design 3 Implementation

**Decision**: React Native Paper for mobile, shadcn/ui for web

**Rationale**:
- React Native Paper implements Material Design 3 spec natively
- shadcn/ui provides customizable Tailwind components for web
- Consistent design language across platforms
- Both support theming, accessibility

**Alternatives Considered**:
- **NativeBase**: Material Design 2, not MD3
- **Custom components**: Too time-consuming for MVP
- **Expo UI Kit**: Less mature than React Native Paper

**Implementation Approach**:
```typescript
// Mobile (React Native Paper)
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    primary: '#1976D2',
    secondary: '#4CAF50',
    tertiary: '#FFC107',
    error: '#F44336'
  }
};

<PaperProvider theme={theme}>
  <App />
</PaperProvider>

// Web (shadcn/ui + Tailwind)
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#1976D2',
        secondary: '#4CAF50'
      }
    }
  }
}
```

**Accessibility**:
- WCAG 2.1 Level AA color contrast ratios
- Keyboard navigation support
- ARIA labels on all interactive elements
- Screen reader tested

**References**:
- Material Design 3: https://m3.material.io/
- React Native Paper: https://callstack.github.io/react-native-paper/
- shadcn/ui: https://ui.shadcn.com/

---

### 6. Monitoring Stack (Prometheus + Grafana + Loki)

**Decision**: Self-hosted Prometheus, Grafana, Loki on Azure Container Instances

**Rationale**:
- Full control over data, no vendor lock-in
- Azure Monitor for infrastructure, custom stack for application metrics
- Loki for log aggregation (cheaper than Elasticsearch)
- Grafana for unified dashboards

**Alternatives Considered**:
- **Datadog/New Relic**: Expensive, vendor lock-in - rejected
- **Azure Monitor alone**: Insufficient for custom application metrics
- **ELK Stack**: Elasticsearch too resource-intensive for logs

**Implementation Approach**:
```yaml
# docker-compose.yml (monitoring stack)
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"
  
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
```

**Metrics to Track**:
- API: Request rate, latency (p50, p95, p99), error rate
- Database: Query time, connection pool usage, slow queries
- Cache: Hit/miss ratio, memory usage
- Payment: Success rate, failure reasons
- Business: Active users, tests taken, conversions

**Alert Rules** (from constitution check):
- **Critical** → PagerDuty: Downtime >2min, API p95 >500ms (5min sustained), Error rate >5%
- **Warning** → Slack: API p95 >300ms (10min sustained), Error rate >1%, Memory >80%

**References**:
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Loki: https://grafana.com/docs/loki/

---

### 7. Database Schema Design Patterns

**Decision**: Prisma ORM with PostgreSQL, normalized schema with strategic denormalization

**Rationale**:
- Prisma provides type-safe database client, migration management
- Normalized design ensures data integrity
- Denormalization (e.g., copy subscription tier into TestAttempt) for query performance
- JSONB for flexible question metadata

**Alternatives Considered**:
- **TypeORM**: More complex, less type-safe than Prisma
- **Raw SQL**: Manual query management, migration complexity
- **NoSQL (MongoDB)**: Unsuitable for relational data (users, subscriptions, tests)

**Schema Patterns**:
```prisma
// Soft deletes for audit trail
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  deletedAt   DateTime?
  
  @@index([deletedAt]) // Fast filtering of active users
}

// Optimistic concurrency control
model TestAttempt {
  id          String   @id @default(uuid())
  version     Int      @default(0) // Increment on each update
  responses   Json     // JSONB for flexible schema
  
  @@index([userId, createdAt]) // Common query pattern
}

// Denormalization for analytics
model TestAttempt {
  // ... other fields
  subscriptionTier String // Copy from Subscription at test start
  // Enables analytics queries without joins
}
```

**Migration Strategy**:
- Use Prisma Migrate for version control
- Shadow database for safe migrations
- Rollback plan for every migration

**References**:
- Prisma: https://www.prisma.io/docs/
- Database design patterns: https://www.postgresql.org/docs/current/ddl.html

---

### 8. Testing Strategy

**Decision**: 80% coverage target with pyramid approach (many unit, some integration, few E2E)

**Rationale**:
- Unit tests: Fast, catch logic errors early (70% of tests)
- Integration tests: API endpoints, database interactions (25% of tests)
- E2E tests: Critical user journeys only (5% of tests)

**Tools**:
- **Jest**: Unit + integration tests (backend, frontend)
- **React Testing Library**: Component tests
- **Supertest**: API endpoint testing
- **Playwright**: E2E web flows
- **Detox**: E2E mobile flows (optional, time-permitting)

**Critical Test Scenarios**:
```typescript
// E2E: Complete test-taking flow
test('user can complete mock test end-to-end', async ({ page }) => {
  await page.goto('/login');
  await login(page, 'test@example.com', 'password');
  await page.click('text=Start Test');
  // Answer questions, submit
  await page.click('text=Submit Test');
  await expect(page.locator('text=Test Results')).toBeVisible();
});

// Integration: Payment webhook
test('Razorpay webhook activates subscription', async () => {
  const response = await request(app)
    .post('/api/webhooks/razorpay')
    .send(validWebhookPayload)
    .set('X-Razorpay-Signature', validSignature);
  
  expect(response.status).toBe(200);
  const subscription = await prisma.subscription.findUnique({
    where: { userId: 'test-user' }
  });
  expect(subscription.status).toBe('active');
});
```

**Coverage Targets**:
- **Models/Services**: 90% (core business logic)
- **API Routes**: 80% (happy path + error cases)
- **Components**: 70% (UI components)
- **E2E**: Critical paths only (login, test, payment)

**References**:
- Jest: https://jestjs.io/docs/
- Playwright: https://playwright.dev/docs/
- Testing pyramid: https://martinfowler.com/articles/practical-test-pyramid.html

---

## Best Practices Summary

### Security
1. **Never trust client**: Validate all inputs server-side
2. **Secrets management**: Azure Key Vault for API keys, connection strings
3. **Rate limiting**: 100 requests/minute per IP (auth endpoints), 1000/minute (general)
4. **SQL injection prevention**: Prisma parameterized queries only
5. **XSS prevention**: Content Security Policy, sanitize user input
6. **CSRF prevention**: SameSite cookies, CSRF tokens

### Performance
1. **Database indexing**: Index all foreign keys, frequently queried columns
2. **Caching strategy**: Redis for session, user profiles (5min TTL), question bank (1hour TTL)
3. **CDN**: Azure CDN for static assets, images
4. **Code splitting**: Next.js dynamic imports, React.lazy for large components
5. **Image optimization**: WebP format, lazy loading, responsive sizes

### Scalability
1. **Horizontal scaling**: Stateless API servers behind load balancer
2. **Database connection pooling**: Prisma pool size = (CPU cores * 2) + 1
3. **Async processing**: Azure Functions for batch jobs (question generation, analytics)
4. **Caching**: Reduce database load with Redis
5. **CDN offloading**: Serve static content from edge

### DevOps
1. **CI/CD**: GitHub Actions for build, test, deploy
2. **Blue-green deployment**: Zero-downtime deployments
3. **Rollback plan**: Keep last 3 versions deployable
4. **Health checks**: `/health` endpoint returns database, Redis, Azure OpenAI status
5. **Logging**: Structured JSON logs, correlation IDs for request tracing

---

## Technology Decision Matrix

| Category | Decision | Confidence | Risk Level |
|----------|----------|------------|------------|
| Backend Language | Node.js 20 + TypeScript | High | Low |
| Web Framework | Next.js 15 | High | Low |
| Mobile Framework | React Native + Expo | High | Medium (offline sync complexity) |
| Database | PostgreSQL 16 | High | Low |
| Cache | Redis 7 | High | Low |
| AI Service | Azure OpenAI GPT-5 | Medium | Medium (pricing TBD, vendor lock-in) |
| Payment Gateway | Razorpay | High | Low |
| Hosting | Azure (Central India) | High | Low |
| Monitoring | Prometheus + Grafana | High | Low |
| Testing | Jest + Playwright | High | Low |

**Risk Mitigation**:
- **Azure OpenAI**: Fallback to pre-generated question bank if API fails
- **Offline Sync**: Extensive testing, gradual rollout, easy rollback
- **Vendor Lock-in**: Abstraction layer for OpenAI client (easy to swap)

---

## Next Steps (Phase 1)

1. ✅ Generate `data-model.md` (entities, relationships, validation)
2. ✅ Generate API contracts in `/contracts/` (OpenAPI specs)
3. ✅ Create `quickstart.md` (local setup guide)
4. ⏭️ Update agent context (add technology stack to `.github/copilot-instructions.md`)

**Phase 1 Deliverables**:
- Detailed data model with all entities, fields, indexes
- OpenAPI 3.0 specifications for all API endpoints
- Step-by-step quickstart guide for developers
- Updated Copilot context for intelligent code suggestions
