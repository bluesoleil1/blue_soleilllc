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

// GET /api/email - Get all sent emails (admin only)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const admin = await verifyAdmin(req)
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const emails = await prisma.email.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 emails
    })

    return res.status(200).json({ emails })
  } catch (error) {
    console.error('Get emails error:', error)
    return res.status(500).json({ message: 'An error occurred' })
  } finally {
    await prisma.$disconnect()
  }
}

