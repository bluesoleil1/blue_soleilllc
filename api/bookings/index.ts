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

// GET /api/bookings - Get all bookings (admin only)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const admin = await verifyAdmin(req)
      if (!admin) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ bookings })
    } catch (error) {
      console.error('Get bookings error:', error)
      return res.status(500).json({ message: 'An error occurred' })
    } finally {
      await prisma.$disconnect()
    }
  }

  // POST /api/bookings - Create new booking
  if (req.method === 'POST') {
    try {
      const { firstName, lastName, email, phone, serviceType, message } = req.body

      if (!firstName || !lastName || !email || !phone || !serviceType) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const booking = await prisma.booking.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          serviceType,
          message: message || null,
          status: 'PENDING',
        },
      })

      return res.status(201).json({ booking })
    } catch (error) {
      console.error('Create booking error:', error)
      return res.status(500).json({ message: 'An error occurred' })
    } finally {
      await prisma.$disconnect()
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}

