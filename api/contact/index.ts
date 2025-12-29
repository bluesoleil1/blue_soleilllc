import { PrismaClient } from '@prisma/client'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const prisma = new PrismaClient()

// POST /api/contact - Create contact form submission
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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

    // TODO: Send email notification using email service
    // await emailService.sendContactNotification({ name, email, phone, subject, message })

    return res.status(201).json({ contact })
  } catch (error) {
    console.error('Create contact error:', error)
    return res.status(500).json({ message: 'An error occurred' })
  } finally {
    await prisma.$disconnect()
  }
}

