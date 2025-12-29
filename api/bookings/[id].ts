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

// PATCH /api/bookings/[id] - Update booking status (admin only)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const admin = await verifyAdmin(req)
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.query
    const { status } = req.body

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid booking ID' })
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    return res.status(200).json({ booking })
  } catch (error) {
    console.error('Update booking error:', error)
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Booking not found' })
    }
    return res.status(500).json({ message: 'An error occurred' })
  } finally {
    await prisma.$disconnect()
  }
}

