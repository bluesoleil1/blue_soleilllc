import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    )

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isDatabaseError = errorMessage.includes('DATABASE') || errorMessage.includes('Prisma') || errorMessage.includes('connection')
    
    return res.status(500).json({ 
      message: isDatabaseError 
        ? 'Database connection error. Please check DATABASE_URL environment variable.' 
        : 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
}

