import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const prisma = new PrismaClient()

// Verify admin authentication
async function verifyAdmin(req: VercelRequest): Promise<{ userId: string; role: string } | null> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string }

    if (decoded.role !== 'ADMIN') {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

// Send email using Resend API or SMTP
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

  // Use Resend if available, otherwise use SMTP
  if (resendApiKey) {
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
  } else {
    // Fallback: Could implement SMTP here if needed
    throw new Error('Email service not configured. Please set RESEND_API_KEY.')
  }
}

// POST /api/email/send - Send email (admin only)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const admin = await verifyAdmin(req)
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { to, subject, html, text, replyTo, cc, bcc } = req.body

    // Input validation
    if (!to || !subject || !html) {
      return res.status(400).json({ message: 'Missing required fields: to, subject, html' })
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
    if (html.length > 100000) {
      return res.status(400).json({ message: 'Email content too long (max 100KB)' })
    }
    if (html.length < 10) {
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
      html: html.trim(),
      text: text ? text.trim() : undefined,
      replyTo: replyTo ? replyTo.trim() : undefined,
      cc: cc ? (Array.isArray(cc) ? cc.map(e => e.trim()) : [cc.trim()]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.map(e => e.trim()) : [bcc.trim()]) : undefined,
    })

    // Store sent email in database
    try {
      await prisma.email.create({
        data: {
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''),
          sentBy: admin.userId,
          status: 'SENT',
        },
      })
    } catch (dbError) {
      console.error('Failed to store email in database:', dbError)
      // Don't fail the request if database storage fails
    }

    return res.status(200).json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('Send email error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
    return res.status(500).json({ message: errorMessage })
  } finally {
    await prisma.$disconnect()
  }
}

