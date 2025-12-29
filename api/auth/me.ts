import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string; role: string }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  } finally {
    await prisma.$disconnect()
  }
}

