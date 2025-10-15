# MERN Auth Server

A production-ready MERN stack server template with authentication, built with Express.js and MongoDB.

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
   npm run build
   npm start
   ```

## 📋 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm test` - Run tests (placeholder)
- `npm run build` - Build the project
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🛠️ Development Features

- **Auto-reload**: Nodemon automatically restarts the server when files change
- **Code formatting**: Prettier ensures consistent code style
- **Linting**: ESLint catches common errors and enforces best practices
- **Hot reload**: Development server restarts automatically on file changes

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
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── nodemon.json         # Nodemon configuration
├── .prettierrc          # Prettier configuration
├── .eslintrc.js         # ESLint configuration
└── README.md           # This file
```

## 🔧 Configuration

### Nodemon Configuration
The `nodemon.json` file configures:
- **Watch directories**: Monitors `controllers/`, `models/`, `routes/`, `middleware/`
- **File extensions**: Watches `.js` and `.json` files
- **Ignore patterns**: Excludes `node_modules/` and test files
- **Restart delay**: 1-second delay to prevent rapid restarts

### Prettier Configuration
The `.prettierrc` file ensures:
- Consistent code formatting across the project
- Single quotes for strings
- Semicolons at the end of statements
- 80-character line width
- 2-space indentation

### ESLint Configuration
The `.eslintrc.js` file provides:
- Node.js environment support
- Common JavaScript best practices
- Error prevention rules
- Code quality enforcement

## 🚀 Production Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Environment variables:**
   - Set `NODE_ENV=production`
   - Configure your MongoDB URI
   - Set a secure JWT secret

## 📝 Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Make changes** to your code

3. **Format code:**
   ```bash
   npm run format
   ```

4. **Check for issues:**
   ```bash
   npm run lint
   ```

5. **Fix issues automatically:**
   ```bash
   npm run lint:fix
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run format`
5. Submit a pull request

## 📄 License

ISC License
