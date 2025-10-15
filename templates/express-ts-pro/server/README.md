Express TS Pro (Celtrix)

Production-ready TypeScript + Express backend template with:

- Logging (Winston) with JSON logs and request IDs
- Security: Helmet, CORS, rate limiting
- Role-based auth (JWT-based; roles via claims)
- Basic notification service (email via Nodemailer)
- File utilities: read XLSX and PDF
- Clean project structure and error handling

Quick Start

```
cp .env.example .env
npm install
npm run dev
```

Health check: GET `/health`

Scripts
- npm run dev: Run with ts-node + nodemon
- npm run build: Type-check and transpile to dist
- npm start: Run compiled app

Env
- PORT (default 4000)
- JWT_SECRET (required for auth)
- SMTP vars for notifications (optional)

Notes
- Upload endpoint: POST `/files/parse` (field: `file`) parses XLSX or PDF.
- Protected example: GET `/admin/stats` requires role `admin`.

