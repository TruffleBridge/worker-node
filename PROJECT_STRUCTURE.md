# Node.js TypeScript Project Structure

This project follows a clean architecture pattern with clear separation of concerns using Sequelize ORM.

## Folder Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── controllers/           # Request handlers
│   └── UserController.ts
├── models/                # Sequelize models (database schemas)
│   └── User.ts
├── services/              # Business logic
│   └── UserService.ts
├── repository/            # Data access layer
│   └── UserRepository.ts
├── routes/                # API routes
│   └── userRoutes.ts
├── validation/            # Input validation
│   └── UserValidation.ts
└── utils/                 # Helper utilities
    └── logger.ts

config/
├── database.ts            # Database configuration

dist/                      # Compiled JavaScript output

```

## Layer Descriptions

### 1. **Routes** (`src/routes/`)
- Defines API endpoints
- Maps HTTP requests to controllers
- Handles validation middleware
- Example: `GET /api/users`, `POST /api/users`

### 2. **Controllers** (`src/controllers/`)
- Handles HTTP requests and responses
- Calls appropriate services
- Returns formatted responses
- Does NOT contain business logic

### 3. **Services** (`src/services/`)
- Contains business logic
- Validates data before persisting
- Orchestrates repository calls
- Handles errors and exceptions

### 4. **Repository** (`src/repository/`)
- Data access layer (DAL)
- Interacts directly with Sequelize models
- CRUD operations
- Database queries isolated here

### 5. **Models** (`src/models/`)
- Sequelize model definitions
- Database schema/table definitions
- Relationships between models
- Type definitions for TypeScript

### 6. **Validation** (`src/validation/`)
- Input validation schemas
- Express validator middleware
- Sanitization rules
- Error messages

### 7. **Utils** (`src/utils/`)
- Helper functions
- Logger utility
- Common utilities reused across layers
- Constants and formatters

### 8. **Config** (`config/`)
- Database configuration
- Environment-specific settings
- External service configurations

## Data Flow

```
Request → Route → Controller → Service → Repository → Model → Database
Response ← Controller ← Service ← Repository ← Model ← Database
```

## Example: Creating a User

1. **Route** receives `POST /api/users` request
2. **Validation** middleware validates input
3. **Controller** extracts and passes data
4. **Service** applies business logic
5. **Repository** calls `User.create()`
6. **Model** interacts with database via Sequelize
7. Response flows back through the chain

## Getting Started

### Install Dependencies
```bash
npm install express sequelize mysql2 cors dotenv express-validator
npm install -D typescript @types/express @types/node ts-node
```

### Configuration
1. Copy `.env.example` to `.env`
2. Update database credentials
3. Run migrations/sync models

### Build & Run
```bash
npm run build      # Compile TypeScript to dist/
npm run dev        # Run development server
npm start          # Run production server
```

### Add to package.json
```json
"scripts": {
  "build": "tsc",
  "dev": "ts-node src/server.ts",
  "start": "node dist/server.js"
}
```

## Best Practices

- Keep controllers thin - move logic to services
- Repositories should only interact with models
- Validation happens before service layer
- Use TypeScript interfaces for type safety
- Log important operations using utils/logger
- Handle errors at each layer appropriately
