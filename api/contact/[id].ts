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

// DELETE /api/contact/[id] - Delete a contact message (admin only)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const admin = await verifyAdmin(req)
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.query

    if (!id || typeof id !== 'string') {
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

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return res.status(200).json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Delete contact error:', error)
    return res.status(500).json({ message: 'An error occurred' })
  } finally {
    await prisma.$disconnect()
  }
}

