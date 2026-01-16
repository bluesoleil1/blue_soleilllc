import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Email service - inline implementation for Vercel serverless
async function sendContactEmail(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  // Use info@bluesoleilfl.com for receiving notifications
  // admin@bluesoleilfl.com is only for login
  const notificationEmail = process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL || 'info@bluesoleilfl.com'
  const emailFrom = process.env.EMAIL_FROM || 'Blue Soleil LLC <info@bluesoleilfl.com>'
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return { success: false }
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #4a9a9e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e3a5f; }
            .value { margin-top: 5px; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #d4a52e; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${escapeHtml(data.name)}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${escapeHtml(data.email)}</a></div>
              </div>
              ${data.phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${data.phone}">${escapeHtml(data.phone)}</a></div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${escapeHtml(data.subject)}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${formatMessage(data.message)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Try SMTP first (preferred method)
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpPort = parseInt(process.env.SMTP_PORT || '587')

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        })

        await transporter.sendMail({
          from: emailFrom,
          to: notificationEmail,
          subject: `New Contact: ${data.subject}`,
          html,
          replyTo: data.email,
        })

        return { success: true }
      } catch (error) {
        console.error('SMTP error:', error)
        // Fall through to Resend API fallback
      }
    }

    // Fallback to Resend API if SMTP fails or is not configured
    if (!resendApiKey) {
      throw new Error('Email service not configured. Please set SMTP credentials or RESEND_API_KEY.')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: notificationEmail,
        subject: `New Contact: ${data.subject}`,
        html,
        reply_to: data.email,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function formatMessage(message: string): string {
  return escapeHtml(message).replace(/\n/g, '<br>')
}

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

// GET /api/contact - Get all contact messages
// POST /api/contact - Create contact form submission
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const admin = await verifyAdmin(req)
      if (!admin) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ contacts })
    } catch (error) {
      console.error('Get contacts error:', error)
      return res.status(500).json({ message: 'An error occurred' })
    } finally {
      await prisma.$disconnect()
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, phone, subject, message } = req.body

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const contact = await prisma.contact.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject,
          message,
        },
      })

      // Send email notification to admin
      try {
        await sendContactEmail({
          name,
          email,
          phone: phone || undefined,
          subject,
          message,
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the request if email fails
      }

      return res.status(201).json({ contact })
    } catch (error) {
      console.error('Create contact error:', error)
      return res.status(500).json({ message: 'An error occurred' })
    } finally {
      await prisma.$disconnect()
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
