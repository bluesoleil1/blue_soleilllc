/**
 * Development server for local API routes
 * This runs alongside Vite dev server to handle API requests
 */

import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 3001

// CORS and JSON parsing
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Initialize Prisma - will use DATABASE_URL from environment or default to SQLite
// Prisma automatically reads DATABASE_URL from environment variables
const prisma = new PrismaClient()

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully')
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error)
    console.error('Make sure DATABASE_URL is set correctly in .env')
    console.error('For SQLite, use: DATABASE_URL="file:./prisma/dev.db"')
  })

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Input validation and sanitization
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Sanitize email (trim and lowercase)
    const sanitizedEmail = email.trim().toLowerCase()

    // Password length check
    if (password.length < 1 || password.length > 200) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // Find user using Prisma (SQL injection protected by Prisma ORM)
    const user = await prisma.user.findUnique({ 
      where: { email: sanitizedEmail } 
    })

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Verify password using bcrypt (timing-safe comparison)
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error('WARNING: JWT_SECRET is too short or missing!')
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    )

    // Return user data (password excluded)
    const { password: _, ...userWithoutPassword } = user
    res.json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword })
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
})

// Bookings routes
app.get('/api/bookings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const decoded = jwt.verify(token, jwtSecret) as { role: string }

    if (decoded.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

app.post('/api/bookings', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, serviceType, message } = req.body

    // Input validation
    if (!firstName || !lastName || !email || !phone || !serviceType) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Sanitize and validate inputs
    const sanitizedFirstName = String(firstName).trim().substring(0, 100)
    const sanitizedLastName = String(lastName).trim().substring(0, 100)
    const sanitizedEmail = String(email).trim().toLowerCase().substring(0, 255)
    const sanitizedPhone = String(phone).trim().substring(0, 50)
    const sanitizedServiceType = String(serviceType).trim()
    const sanitizedMessage = message ? String(message).trim().substring(0, 2000) : null

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate service type
    const validServiceTypes = ['TERM_LIFE', 'PERMANENT_LIFE', 'INDEX_UNIVERSAL_LIFE', 'INDEX_ANNUITY']
    if (!validServiceTypes.includes(sanitizedServiceType)) {
      return res.status(400).json({ message: 'Invalid service type' })
    }

    // Create booking using Prisma (SQL injection protected)
    const booking = await prisma.booking.create({
      data: { 
        firstName: sanitizedFirstName, 
        lastName: sanitizedLastName, 
        email: sanitizedEmail, 
        phone: sanitizedPhone, 
        serviceType: sanitizedServiceType, 
        message: sanitizedMessage, 
        status: 'PENDING' 
      },
    })

    res.status(201).json({ booking })
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const decoded = jwt.verify(token, jwtSecret) as { role: string }

    if (decoded.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const booking = await prisma.booking.update({ where: { id }, data: { status } })
    res.json({ booking })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Booking not found' })
    }
    console.error('Update booking error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

// Contact route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Input validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Sanitize and validate inputs
    const sanitizedName = String(name).trim().substring(0, 100)
    const sanitizedEmail = String(email).trim().toLowerCase().substring(0, 255)
    const sanitizedPhone = phone ? String(phone).trim().substring(0, 50) : null
    const sanitizedSubject = String(subject).trim().substring(0, 200)
    const sanitizedMessage = String(message).trim().substring(0, 2000)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Create contact using Prisma (SQL injection protected)
    const contact = await prisma.contact.create({
      data: { 
        name: sanitizedName, 
        email: sanitizedEmail, 
        phone: sanitizedPhone, 
        subject: sanitizedSubject, 
        message: sanitizedMessage 
      },
    })

    res.status(201).json({ contact })
  } catch (error) {
    console.error('Create contact error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📝 API routes available at http://localhost:${PORT}/api`)
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down API server...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

