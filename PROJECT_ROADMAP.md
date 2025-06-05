# Customer Feedback System - Technical Roadmap

## Project Overview
Building a secure customer feedback system with consent management, one-time survey links, GPT integration, and Azure Data Lake storage.

## Phase 1: Project Setup & Architecture (Week 1)

### 1.1 Development Environment Setup
- [ ] Initialize Git repository with proper .gitignore
- [ ] Set up Python virtual environment (venv/conda)
- [ ] Create project structure:
  ```
  customer-feedback/
  ├── backend/
  │   ├── app/
  │   │   ├── __init__.py
  │   │   ├── main.py
  │   │   ├── models/
  │   │   ├── routes/
  │   │   ├── services/
  │   │   └── utils/
  │   ├── requirements.txt
  │   ├── .env.example
  │   └── Dockerfile
  ├── frontend/
  │   ├── src/
  │   ├── public/
  │   └── package.json
  └── docs/
  ```

### 1.2 Technology Stack Decisions
- **Backend**: Python with FastAPI
- **Database**: PostgreSQL for relational data + Redis for session/token management
- **Frontend**: React with TypeScript
- **External Services**: 
  - OpenAI GPT API for content generation
  - Azure Data Lake Gen2 for JSON storage
  - SendGrid/SMTP for email delivery
- **Authentication**: JWT tokens for secure links
- **ORM**: SQLAlchemy with Alembic for migrations
- **Deployment**: Docker containers + Uvicorn ASGI server

### 1.3 Azure Services Setup
- [ ] Create Azure Data Lake Storage Gen2 account
- [ ] Set up container for feedback JSON files
- [ ] Configure access keys and connection strings
- [ ] Create Azure service principal for authentication

## Phase 2: Database Design & Backend Foundation (Week 2)

### 2.1 Database Schema Design
```sql
-- Branches table
CREATE TABLE branches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    branch_id VARCHAR(50) REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    email_consent BOOLEAN NOT NULL,
    purpose_of_visit VARCHAR(255),
    branch_id VARCHAR(50) REFERENCES branches(id),
    staff_id INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey links table (for deduplication and security)
CREATE TABLE survey_links (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback responses table
CREATE TABLE feedback_responses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    survey_link_id INTEGER REFERENCES survey_links(id),
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    textual_feedback TEXT CHECK (LENGTH(textual_feedback) <= 500),
    sentiment VARCHAR(20), -- positive, neutral, negative
    gpt_summary TEXT,
    azure_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Backend API Structure
- [ ] Set up FastAPI application with middleware (CORS, security headers)
- [ ] Configure database connection (SQLAlchemy + asyncpg for PostgreSQL, redis-py)
- [ ] Implement environment variable management (python-dotenv)
- [ ] Set up logging (Python logging + loguru)
- [ ] Create base API structure with FastAPI exception handling
- [ ] Set up Pydantic models for request/response validation

### 2.3 Core Backend Services
- [ ] Database service layer (SQLAlchemy ORM with async support)
- [ ] Email service integration (SendGrid/SMTP)
- [ ] GPT service integration (OpenAI Python SDK)
- [ ] Azure Data Lake service integration (Azure SDK for Python)
- [ ] JWT service for secure token management (python-jose)

## Phase 3: Backend API Development (Week 3-4)

### 3.1 Customer Data Capture API
```python
# POST /api/customers
# Pydantic model for request validation:
class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    mobile: Optional[str] = Field(None, regex=r'^\+?[\d\s-()]+$')
    email_consent: bool
    purpose_of_visit: str = Field(..., min_length=1)
    branch_id: str = Field(..., min_length=1)
    branch_name: str = Field(..., min_length=1)
    staff_name: str = Field(..., min_length=1)

class CustomerResponse(BaseModel):
    id: int
    message: str
    survey_triggered: bool
```
- [ ] Input validation and sanitization using Pydantic
- [ ] Branch and staff creation/lookup logic
- [ ] Customer data storage with SQLAlchemy
- [ ] Return customer ID for next steps
- [ ] Automatic API documentation with FastAPI

### 3.2 Survey Email Trigger API
```python
# POST /api/survey/trigger/{customer_id}
@app.post("/api/survey/trigger/{customer_id}")
async def trigger_survey_email(customer_id: int, db: Session = Depends(get_db)):
    # Implementation details
```
- [ ] Check customer consent status
- [ ] Generate secure one-time JWT token with expiration
- [ ] Store token in survey_links table
- [ ] Generate GPT email content with customer personalization
- [ ] Send email with secure feedback link using async email service
- [ ] Handle email delivery failures with proper error responses

### 3.3 GPT Integration Service
- [ ] OpenAI Python SDK integration
- [ ] Email content generation function:
  ```python
  async def generate_survey_email(customer_name: str, purpose_of_visit: str, branch_name: str) -> str:
      # GPT integration for personalized emails
  ```
- [ ] Feedback summary generation function:
  ```python
  async def generate_feedback_summary(textual_feedback: str, star_rating: int) -> str:
      # GPT integration for summary generation
  ```
- [ ] Error handling and rate limiting with tenacity library
- [ ] Async implementation for better performance

### 3.4 Feedback Submission API
```python
# GET /api/feedback/{token} (render feedback form data)
# POST /api/feedback/{token} (submit feedback)

class FeedbackSubmission(BaseModel):
    star_rating: int = Field(..., ge=1, le=5)
    textual_feedback: str = Field(..., max_length=500)

@app.post("/api/feedback/{token}")
async def submit_feedback(token: str, feedback: FeedbackSubmission, db: Session = Depends(get_db)):
    # Implementation
```
- [ ] Token validation and expiration check using JWT
- [ ] One-time use enforcement with database constraints
- [ ] Feedback form data validation with Pydantic
- [ ] Sentiment analysis integration (TextBlob/VADER or Azure Cognitive Services)
- [ ] GPT summary generation
- [ ] Azure Data Lake JSON storage
- [ ] Database update with all feedback data

### 3.5 Azure Data Lake Integration
- [ ] Azure SDK for Python integration
- [ ] JSON file upload function:
  ```python
  async def upload_feedback_to_azure(feedback_data: dict, customer_id: int) -> str:
      # Azure Data Lake integration
  ```
- [ ] Proper error handling for Azure operations
- [ ] File naming convention: `feedback_{customer_id}_{timestamp}.json`
- [ ] Async file operations for better performance

## Phase 4: Frontend Development (Week 5-6)

### 4.1 React Application Setup
- [ ] Create React app with TypeScript
- [ ] Set up routing (React Router)
- [ ] Configure CSS framework (Tailwind CSS/Material-UI)
- [ ] Set up form validation (Formik/React Hook Form)
- [ ] Configure HTTP client (Axios) to work with FastAPI backend

### 4.2 Customer Data Capture Form
- [ ] Create responsive form component
- [ ] Implement field validation:
  - Required fields validation
  - Email format validation
  - Mobile number format validation
- [ ] Branch and staff selection dropdowns
- [ ] Purpose of visit selection
- [ ] Email consent checkbox with clear labeling
- [ ] Form submission handling with loading states
- [ ] Success/error message display
- [ ] Integration with FastAPI automatic validation responses

### 4.3 Feedback Form Component
- [ ] Token validation on page load
- [ ] Star rating component (1-5 stars)
- [ ] Text area for feedback (500 character limit with counter)
- [ ] Form submission with validation
- [ ] Thank you page after successful submission
- [ ] Error handling for expired/invalid tokens
- [ ] FastAPI error response handling

### 4.4 UI/UX Implementation
- [ ] Mobile-responsive design
- [ ] Accessibility compliance (WCAG guidelines)
- [ ] Loading states and spinner components
- [ ] Toast notifications for user feedback
- [ ] Form field validation indicators

## Phase 5: Security & Validation (Week 7)

### 5.1 Security Implementation
- [ ] JWT token security with proper signing (python-jose)
- [ ] Rate limiting using slowapi (FastAPI + Redis)
- [ ] Input sanitization to prevent XSS/SQL injection (Pydantic validation)
- [ ] CORS configuration in FastAPI
- [ ] Security headers middleware
- [ ] Environment variable security audit

### 5.2 Link Security & Deduplication
- [ ] Token expiration logic (24-48 hours) using JWT claims
- [ ] Database-level unique constraints
- [ ] Redis caching for token validation
- [ ] Proper error messages for expired/used links
- [ ] Audit logging for security events

### 5.3 Data Validation
- [ ] Comprehensive input validation using Pydantic models
- [ ] Database constraints enforcement with SQLAlchemy
- [ ] API response validation with FastAPI
- [ ] Error handling standardization using FastAPI exception handlers

## Phase 6: Testing & Quality Assurance (Week 8)

### 6.1 Backend Testing
- [ ] Unit tests using pytest and pytest-asyncio
- [ ] Integration tests for FastAPI endpoints using httpx
- [ ] Database operation testing with pytest fixtures
- [ ] External service integration testing (mocked with responses/httpx_mock)
- [ ] Security testing (token validation, SQL injection, etc.)
- [ ] Test coverage reporting with coverage.py

### 6.2 Frontend Testing
- [ ] Component unit tests (Jest/React Testing Library)
- [ ] Form validation testing
- [ ] User interaction testing
- [ ] Responsive design testing

### 6.3 End-to-End Testing
- [ ] Complete user journey testing
- [ ] Email workflow testing
- [ ] Link expiration testing
- [ ] Multiple submission prevention testing

## Phase 7: Deployment & DevOps (Week 9)

### 7.1 Containerization
- [ ] Create Dockerfile for FastAPI backend:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install -r requirements.txt
  COPY . .
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- [ ] Docker compose for local development
- [ ] Environment-specific configurations

### 7.2 CI/CD Pipeline
- [ ] GitHub Actions or Azure DevOps setup
- [ ] Automated testing in pipeline (pytest)
- [ ] Environment-specific deployments
- [ ] Alembic database migration scripts

### 7.3 Production Deployment
- [ ] Azure Container Apps or Heroku deployment (easy FastAPI hosting)
- [ ] Railway.app or Render.com for simple deployment
- [ ] Database setup in production (PostgreSQL + Redis)
- [ ] Environment variables configuration
- [ ] SSL certificate setup
- [ ] Domain configuration

## Phase 8: Monitoring & Documentation (Week 10)

### 8.1 Monitoring Setup
- [ ] Application logging (Python logging + structlog)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database query monitoring
- [ ] Email delivery monitoring

### 8.2 Documentation
- [ ] Automatic API documentation (FastAPI generates OpenAPI/Swagger docs)
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] User manual
- [ ] Troubleshooting guide

## Technical Specifications

### Python Dependencies (requirements.txt)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
asyncpg==0.29.0
alembic==1.12.1
pydantic[email]==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
redis==5.0.1
openai==1.3.7
azure-storage-file-datalake==12.14.0
sendgrid==6.10.0
python-dotenv==1.0.0
loguru==0.7.2
slowapi==0.1.9
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
textblob==0.17.1
tenacity==8.2.3
```

### Environment Variables Required
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
REDIS_URL=redis://localhost:6379

# External Services
OPENAI_API_KEY=sk-...
AZURE_STORAGE_CONNECTION_STRING=...
SENDGRID_API_KEY=...

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=48

# Application
ENVIRONMENT=production
FRONTEND_URL=https://...
```

### Key Security Measures
1. JWT tokens with short expiration times
2. Rate limiting on all endpoints using slowapi
3. Input validation and sanitization with Pydantic
4. HTTPS enforcement
5. CORS configuration
6. Database connection encryption
7. Environment variable security

### Performance Considerations
1. Database indexing on frequently queried fields
2. Redis caching for token validation
3. Async database operations with SQLAlchemy
4. Connection pooling for database
5. Async processing for email sending
6. Pagination for large datasets
7. FastAPI's high performance with async/await

### FastAPI Advantages for This Project
1. **Automatic API Documentation**: Built-in Swagger/OpenAPI docs
2. **Fast Development**: Less boilerplate code
3. **Type Safety**: Pydantic models with automatic validation
4. **High Performance**: Built on Starlette and Pydantic
5. **Easy Deployment**: Simple Docker deployment
6. **Great for Demos**: Interactive API docs perfect for showing managers
7. **Python Ecosystem**: Access to excellent ML/AI libraries

## Success Metrics
- [ ] 100% single-use link enforcement
- [ ] <2 second page load times
- [ ] 99.9% uptime
- [ ] Zero security vulnerabilities
- [ ] Mobile responsiveness across devices
- [ ] WCAG 2.1 AA accessibility compliance

## Risk Mitigation
1. **External API Failures**: Implement retry logic with tenacity
2. **Email Delivery Issues**: Multiple email provider fallback
3. **Database Failures**: Connection pooling and retry logic
4. **Security Breaches**: Regular security audits and monitoring
5. **Performance Issues**: Load testing and optimization

## Easy Deployment Options for Demo
1. **Railway.app**: Simple Git-based deployment
2. **Render.com**: Free tier with database
3. **Heroku**: Easy deployment with add-ons
4. **Azure Container Apps**: Serverless container hosting
5. **DigitalOcean App Platform**: Simple and affordable

This roadmap provides a comprehensive, step-by-step approach to building the customer feedback system using Python/FastAPI, making it perfect for demonstrating Python skills to management while addressing all requirements from the objective document. 