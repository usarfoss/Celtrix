# Enhanced MERN Auth Server

A production-ready MERN stack server template with authentication, built with Express.js and MongoDB. This template includes comprehensive development tools and best practices.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build:prod
   ```

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm run dev:debug` - Start development server with debugging enabled

### Testing
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Building
- `npm run build` - Build the project (placeholder for JS)
- `npm run build:prod` - Build and start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run lint:staged` - Run ESLint on staged files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run format:staged` - Format staged files

### Maintenance
- `npm run clean` - Remove node_modules and lock files
- `npm run clean:install` - Clean and reinstall dependencies
- `npm run validate` - Run all quality checks (lint, format, test)
- `npm run precommit` - Run validation before commit

### Git Hooks
- `npm run prepare` - Setup Husky git hooks

## 🛠️ Development Features

### Auto-reload
- **Nodemon**: Automatically restarts the server when files change
- **Smart watching**: Monitors controllers, models, routes, middleware, utils, and config directories
- **Ignore patterns**: Excludes tests, coverage, and build directories

### Code Formatting
- **Prettier**: Ensures consistent code style across the project
- **Pre-commit hooks**: Automatically format code before commits
- **Staged files**: Only format files that are staged for commit

### Testing
- **Jest**: Comprehensive testing framework with coverage reports
- **Supertest**: API endpoint testing
- **Test database**: Separate MongoDB database for testing
- **Test setup**: Automatic database cleanup between tests

### Linting
- **ESLint**: Catches common errors and enforces best practices
- **Auto-fix**: Automatically fixes fixable linting errors
- **Pre-commit**: Runs linting on staged files

### Git Hooks
- **Husky**: Manages git hooks for code quality
- **Lint-staged**: Runs tools only on staged files for faster commits

## 📁 Project Structure

```
server/
├── controllers/          # Route controllers
│   └── authController.js
├── models/              # Database models
│   └── User.js
├── routes/              # API routes
│   └── authRoutes.js
├── middleware/          # Custom middleware (optional)
├── utils/               # Utility functions (optional)
├── config/              # Configuration files (optional)
├── tests/               # Test files
│   ├── setup.js         # Test setup and teardown
│   └── auth.test.js     # Authentication tests
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── nodemon.json         # Nodemon configuration
├── jest.config.js       # Jest testing configuration
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore patterns
├── .lintstagedrc.js     # Lint-staged configuration
├── .eslintrc.js         # ESLint configuration
└── README.md           # This file
```

## 🔧 Configuration

### Nodemon Configuration
The `nodemon.json` file configures:
- **Watch directories**: Monitors specific folders for changes
- **File extensions**: Watches .js and .json files
- **Ignore patterns**: Excludes test files and build outputs
- **Environment**: Sets NODE_ENV to development
- **Events**: Provides feedback on server restarts

### Jest Configuration
The `jest.config.js` file configures:
- **Test environment**: Node.js environment for server testing
- **Coverage**: Generates coverage reports in multiple formats
- **Setup files**: Runs test setup before each test suite
- **Timeouts**: Configures test timeouts for async operations

### Prettier Configuration
The `.prettierrc` file enforces:
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings
- **Trailing commas**: ES5 compatible trailing commas
- **Print width**: 80 character line limit
- **Tab width**: 2 spaces for indentation

### Lint-staged Configuration
The `.lintstagedrc.js` file:
- **JavaScript files**: Runs ESLint and Prettier
- **JSON/Markdown**: Runs Prettier only
- **Git add**: Automatically stages formatted files

## 🧪 Testing

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Setup**: Database connection and cleanup
- **Authentication**: User registration and login tests
- **API endpoints**: Request/response validation
- **Error handling**: Invalid input and error scenarios

### Coverage Reports
Coverage reports are generated in:
- **Text**: Console output
- **HTML**: Detailed browser-viewable report
- **LCOV**: For CI/CD integration

## 🚀 Production Deployment

### Build Process
```bash
# Build for production
npm run build:prod
```

### Environment Variables
Ensure these environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

## 📝 Best Practices

### Code Organization
- Keep controllers thin and focused on request/response handling
- Use models for database operations
- Implement middleware for cross-cutting concerns
- Separate utility functions into dedicated modules

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error middleware
- Return consistent error response formats
- Log errors appropriately

### Security
- Validate all input data
- Use helmet for security headers
- Implement rate limiting
- Sanitize user input
- Use environment variables for secrets

### Performance
- Use connection pooling for databases
- Implement caching where appropriate
- Monitor and optimize slow queries
- Use compression middleware

## 🔗 Related Templates

- **MERN+Tailwind+Auth**: This enhanced template
- **MEVN+Tailwind+Auth**: Vue.js variant with similar enhancements
- **T3 Stack**: Next.js with TypeScript and tRPC
- **Hono**: Lightweight edge runtime templates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run validate` to ensure code quality
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
