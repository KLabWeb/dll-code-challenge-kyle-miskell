# DLL Coding Challenge - User Management Application

A production-ready, full-stack application for browsing and managing user data with sorting and pagination capabilities, built with enterprise-grade features for financial services.

- **Author:** Kyle Miskell (kmiskell@protonmail.com)
- **Boilerplate Author:** Chris Kurhan (chris.kurhan@dllgroup.com)

## Overview

This repository contains a complete user management system consisting of:

- **Client**: A modern, responsive React application with sortable columns, customizable pagination, and a clean UI built with React and Tailwind CSS
- **Server**: An Express REST API providing user data with pagination, sorting, and enterprise features including request tracking, API versioning, and comprehensive logging

## Project Structure

```
.
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── services/    # API client
│   │   ├── config/      # App configuration
│   │   └── tests/       # Test files
│   └── package.json
├── server/              # Express backend API
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # REST API routes
│   │   ├── middleware/  # Validation, error handling, rate limiting, logging
│   │   ├── config/      # Configuration files
│   │   └── data/        # Mock data
│   └── package.json
├── .nvmrc               # Node.js version specification
└── README.md
```

## Quick Start

### Prerequisites

- Node.js v18.17.0 (specified in `.nvmrc`)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KLabWeb/dll-code-challenge-kyle-miskell.git
cd dll-code-challenge-kyle-miskell
```

2. Install server dependencies:
```bash
cd server
npm install
cp .env.example .env
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

### Running the Application

#### Start the Server (Terminal 1)

```bash
cd ../server
npm run dev
```

Server will run at [http://localhost:3001](http://localhost:3001)

#### Start the Client (Terminal 2)

```bash
cd ../client
npm start
```

Client will open at [http://localhost:3000](http://localhost:3000)

---

## API Documentation

### Interactive Documentation

Visit [http://localhost:3001/api-docs](http://localhost:3001/api-docs) for interactive API documentation powered by Swagger UI.

### API Endpoints

#### GET /api/v1/users (or /api/users)

Retrieve a paginated list of users with optional sorting.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `size` (optional, default: 10, max: 100) - Items per page
- `sort` (optional) - Sort by field (name | id)

**Response Headers:**
- `X-Request-ID` - Unique identifier for request tracing

**Response:**
```json
{
  "data": [
    { "id": 0, "name": "Jorn" },
    { "id": 1, "name": "Mike" },
    { "id": 2, "name": "Andrew" }
  ],
  "paging": {
    "totalResults": 50,
    "previous": "http://localhost:3001/api/v1/users?page=1&size=10",
    "next": "http://localhost:3001/api/v1/users?page=3&size=10"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid sort field. Valid fields: name, id",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### GET /api/health

Health check endpoint for monitoring and DevOps.

**Response:**
```json
{
  "status": "healthy",
  "service": "user-management-api",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "environment": "development",
  "node": {
    "version": "v18.17.0",
    "platform": "linux",
    "arch": "x64"
  },
  "memory": {
    "rss": "45MB",
    "heapTotal": "20MB",
    "heapUsed": "15MB",
    "external": "2MB"
  }
}
```

### API Examples

**Get all users with default pagination:**
```bash
curl http://localhost:3001/api/v1/users
```

**Get specific page:**
```bash
curl http://localhost:3001/api/v1/users?page=2
```

**Custom page size:**
```bash
curl http://localhost:3001/api/v1/users?size=25
```

**Sort by name (alphabetically):**
```bash
curl http://localhost:3001/api/v1/users?sort=name
```

**Combined parameters:**
```bash
curl http://localhost:3001/api/v1/users?sort=name&page=2&size=15
```

---

## Client Scripts

```bash
# Development
npm start                # Start development server

# Building
npm run build            # Create production build

# Testing
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI mode
npm run test:all         # Run all tests

# Code Quality
npm run lint             # Check for linting issues
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## Server Scripts

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run test suite
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Check for linting issues
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

---

## Configuration

### Client Configuration

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Server Configuration

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=3001
HOST=localhost
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Node.js Version

This project uses Node.js v18.17.0. If you use nvm, load proper version from .nvmrc with:

```bash
nvm use
```

---

## Key Features

### Security

- Input sanitization with validator.js
- Rate limiting with configurable thresholds
- Helmet.js security headers
- CORS configuration
- Request validation middleware
- Error handling with proper status codes

### Observability

- Request ID tracking for distributed tracing
- Structured logging with Winston
- Response time monitoring with slow request detection
- Comprehensive error logging with stack traces
- Health check endpoint with detailed metrics
- File-based log persistence

### DevOps Ready

- API versioning for backward compatibility
- Graceful shutdown with 10-second timeout
- Environment-based configuration
- Docker-ready (health checks, signal handling)
- Azure/Kubernetes compatible
- .nvmrc for Node.js version consistency

### API Standards

- OpenAPI 3.0 specification
- Interactive Swagger documentation
- RESTful design principles
- Consistent error response format
- Comprehensive request/response examples

---

## Development Guidelines

### Code Style

- Follow ESLint and Prettier configurations
- Use TypeScript for type safety
- Write meaningful component and variable names
- Keep components small and focused on single responsibility
- Add tests for new features

### Testing Strategy

1. **Unit Tests**: Test individual components and functions in isolation
2. **Integration Tests**: Test component interactions and data flow
3. **E2E Tests**: Test complete user workflows from UI to API

### Accessibility

- Use semantic HTML elements
- Include ARIA labels for screen readers
- Ensure keyboard navigation works
- Maintain color contrast ratios

---

## Troubleshooting

### Port Already in Use

If port 3000 (client) or 3001 (server) is occupied:

```bash
# Client
PORT=3002 npm start

# Server - update .env file
PORT=3002

# Or Kill the existing port processes
kill -9 $(lsof -ti:3000
kill -9 $(lsof -ti:3001
```

### API Connection Issues

Ensure:
- Backend server is running on the expected port (default: 3001)
- `REACT_APP_API_URL` environment variable is set correctly in client
- CORS is properly configured in server

### Build Errors

Clear cache and reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Node Version Mismatch

Use the correct Node.js version:

```bash
nvm install 18.17.0
nvm use
```

---

## Architecture Highlights

### Request Flow

1. Client sends request → API receives with unique request ID
2. Request ID middleware attaches UUID
3. Request logger captures timing and metadata
4. Rate limiter checks request limits
5. Validation middleware sanitizes inputs
6. Controller processes request
7. Service layer applies business logic
8. Response includes request ID header
9. Request logger captures completion time

### Error Handling

All errors include:
- Machine-readable error code
- Human-readable message
- Request ID for tracing
- ISO timestamp
- Appropriate HTTP status code

### Logging Strategy

- **Debug**: Detailed operational information
- **Info**: General informational messages
- **Warn**: Warning messages (slow requests, validation errors)
- **Error**: Error events (unhandled errors, server errors)
- **HTTP**: HTTP request completion logs

---

## License

Private - See repository license file

## Related Resources

- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Playwright](https://playwright.dev)
- [OpenAPI Specification](https://swagger.io/specification/)
