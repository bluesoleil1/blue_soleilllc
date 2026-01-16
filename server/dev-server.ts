/**
 * Development server for local API routes
 * This runs alongside Vite dev server to handle API requests
 */

import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: string };
    }
  }
}

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

// DELETE /api/bookings/:id - Delete a booking (admin only)
app.delete('/api/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ message: 'Invalid booking ID' })
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    // Delete the booking
    await prisma.booking.delete({
      where: { id },
    })

    res.json({ message: 'Booking deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Booking not found' })
    }
    console.error('Delete booking error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

// Email sending function using Resend API
async function sendEmail(data: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}) {
  const emailFrom = process.env.EMAIL_FROM || 'Blue Soleil LLC <info@bluesoleilfl.com>'
  const replyTo = process.env.EMAIL_REPLY_TO || 'info@bluesoleilfl.com'
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, email will not be sent')
    return { success: false, messageId: null }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
        text: data.text || data.html.replace(/<[^>]*>/g, ''),
        reply_to: data.replyTo || replyTo,
        cc: data.cc ? (Array.isArray(data.cc) ? data.cc : [data.cc]) : undefined,
        bcc: data.bcc ? (Array.isArray(data.bcc) ? data.bcc : [data.bcc]) : undefined,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('Resend API error:', error)
    throw error
  }
}

// Helper function to verify admin authentication
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string }

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Contact routes
// GET /api/contact - Get all contact messages (admin only)
app.get('/api/contact', authenticateAdmin, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ contacts })
  } catch (error) {
    console.error('Get contacts error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

// POST /api/contact - Create contact form submission
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

// DELETE /api/contact/:id - Delete a contact message (admin only)
app.delete('/api/contact/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ message: 'Invalid contact ID' })
    }

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    // Delete the contact
    await prisma.contact.delete({
      where: { id },
    })

    res.json({ message: 'Contact deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Contact not found' })
    }
    console.error('Delete contact error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

// Email routes
// GET /api/email - Get all sent emails (admin only)
app.get('/api/email', authenticateAdmin, async (req, res) => {
  try {
    const emails = await prisma.email.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 emails
    })
    res.json({ emails })
  } catch (error) {
    console.error('Get emails error:', error)
    res.status(500).json({ message: 'An error occurred' })
  }
})

// POST /api/email/send - Send email (admin only)
app.post('/api/email/send', authenticateAdmin, async (req, res) => {
  try {
    const { to, subject, html, text, replyTo, cc, bcc } = req.body

    // Input validation
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ message: 'Missing required fields: to, subject, and html or text' })
    }

    // Validate email format and prevent injection
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const recipients = Array.isArray(to) ? to : [to]
    
    // Limit number of recipients (prevent spam)
    if (recipients.length > 50) {
      return res.status(400).json({ message: 'Too many recipients. Maximum 50 allowed.' })
    }
    
    for (const email of recipients) {
      const trimmedEmail = email.trim()
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: `Invalid email address: ${trimmedEmail}` })
      }
      // Prevent email injection attacks
      if (trimmedEmail.includes('\n') || trimmedEmail.includes('\r') || trimmedEmail.includes('%0a')) {
        return res.status(400).json({ message: 'Invalid email format detected' })
      }
    }

    // Validate subject length and content
    const sanitizedSubject = subject.trim().substring(0, 200)
    if (sanitizedSubject.length === 0) {
      return res.status(400).json({ message: 'Subject cannot be empty' })
    }

    // Sanitize HTML content (basic checks)
    const emailContent = html || text || ''
    if (emailContent.length > 100000) {
      return res.status(400).json({ message: 'Email content too long (max 100KB)' })
    }
    if (emailContent.length < 10) {
      return res.status(400).json({ message: 'Email content too short' })
    }

    // Validate CC and BCC if provided
    if (cc) {
      const ccRecipients = Array.isArray(cc) ? cc : [cc]
      for (const email of ccRecipients) {
        const trimmedEmail = email.trim()
        if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
          return res.status(400).json({ message: `Invalid CC email address: ${trimmedEmail}` })
        }
      }
    }

    if (bcc) {
      const bccRecipients = Array.isArray(bcc) ? bcc : [bcc]
      for (const email of bccRecipients) {
        const trimmedEmail = email.trim()
        if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
          return res.status(400).json({ message: `Invalid BCC email address: ${trimmedEmail}` })
        }
      }
    }

    // Send email
    const result = await sendEmail({
      to: recipients.map(e => e.trim()),
      subject: sanitizedSubject,
      html: html || text?.replace(/\n/g, '<br>') || '',
      text: text || html?.replace(/<[^>]*>/g, '') || '',
      replyTo: replyTo ? replyTo.trim() : undefined,
      cc: cc ? (Array.isArray(cc) ? cc.map(e => e.trim()) : [cc.trim()]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.map(e => e.trim()) : [bcc.trim()]) : undefined,
    })

    // Store sent email in database
    try {
      await prisma.email.create({
        data: {
          to: Array.isArray(to) ? to.join(', ') : to,
          subject: sanitizedSubject,
          html: html || text?.replace(/\n/g, '<br>') || '',
          text: text || html?.replace(/<[^>]*>/g, '') || '',
          sentBy: req.user!.userId,
          status: result.success ? 'SENT' : 'FAILED',
          messageId: result.messageId || null,
        },
      })
    } catch (dbError) {
      console.error('Failed to store email in database:', dbError)
      // Don't fail the request if database storage fails
    }

    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully',
      })
    } else {
      res.status(500).json({ message: 'Failed to send email' })
    }
  } catch (error) {
    console.error('Send email error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
    
    // Try to store failed email in database
    try {
      await prisma.email.create({
        data: {
          to: Array.isArray(req.body.to) ? req.body.to.join(', ') : req.body.to,
          subject: req.body.subject || 'Failed to send',
          html: req.body.html || req.body.text || '',
          text: req.body.text || req.body.html?.replace(/<[^>]*>/g, '') || '',
          sentBy: req.user!.userId,
          status: 'FAILED',
        },
      })
    } catch (dbError) {
      console.error('Failed to store failed email in database:', dbError)
    }
    
    res.status(500).json({ message: errorMessage })
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

