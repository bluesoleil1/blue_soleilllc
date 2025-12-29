// Script to create admin user programmatically
// Run with: bun run scripts/create-admin.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  // Get admin credentials from environment or prompt
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bluesoleil.com'
  const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword()
  
  if (!process.env.ADMIN_PASSWORD) {
    console.log('\n⚠️  No ADMIN_PASSWORD set in environment.')
    console.log('Generated secure password:', adminPassword)
    console.log('⚠️  IMPORTANT: Save this password securely!\n')
  }
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('\n⚠️  Admin user already exists!')
    console.log(`Email: ${adminEmail}`)
    console.log(`Role: ${existingAdmin.role}`)
    console.log('\nTo update the password, delete the existing user first or use Prisma Studio.\n')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    }
  })

  console.log('\n✅ Admin user created successfully!\n')
  console.log('=== Admin Credentials ===')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log(`Role: ${admin.role}`)
  console.log(`ID: ${admin.id}`)
  console.log('\nYou can now log in at /login\n')
}

function generateSecurePassword(): string {
  // Generate a secure random password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

createAdmin()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

