import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'

const app = express()
const prisma = new PrismaClient()
const upload = multer({ dest: 'uploads/' })

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

const limiter = rateLimit({ windowMs: 60_000, max: 60 })
app.use(limiter)

// Basic RBAC middleware scaffold
function requireRole(roles: Array<'ADMIN' | 'USER'>) {
  return (req, res, next) => {
    const role = (req.headers['x-role'] as string) || 'USER'
    if (!roles.includes(role as any)) return res.status(403).json({ message: 'Forbidden' })
    next()
  }
}

app.get('/api/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1` // ensures DB connectivity
  res.json({ message: 'OK' })
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file?.filename })
})

app.get('/api/users', requireRole(['ADMIN']), async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
  res.json(users)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`)
})


