// Script to set up production database and create admin user
// Run with: DATABASE_URL="your-postgres-url" ADMIN_EMAIL="admin@bluesoleilfl.com" ADMIN_PASSWORD="weCare4theWork$" npx tsx scripts/setup-production-db.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...\n')

  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
    console.error('❌ ERROR: DATABASE_URL must be set and point to PostgreSQL')
    console.error('   Example: DATABASE_URL="postgresql://user:pass@host:5432/db"')
    process.exit(1)
  }

  console.log('✅ DATABASE_URL is set')
  console.log(`   Database: ${databaseUrl.split('@')[1] || 'hidden'}\n`)

  // Check admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bluesoleilfl.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'weCare4theWork$'

  if (!adminPassword) {
    console.error('❌ ERROR: ADMIN_PASSWORD must be set')
    process.exit(1)
  }

  try {
    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Push schema to database
    console.log('📋 Pushing database schema...')
    // Note: This requires running `prisma db push` separately, but we'll check if tables exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `
    console.log(`   Found ${tables.length} tables in database`)

    // Check if User table exists
    const userTableExists = tables.some(t => t.tablename === 'User')
    if (!userTableExists) {
      console.log('\n⚠️  User table does not exist!')
      console.log('   Please run: npx prisma db push')
      console.log('   This will create all tables in the database.\n')
    } else {
      console.log('✅ User table exists\n')
    }

    // Check if admin user exists
    console.log('👤 Checking for admin user...')
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${adminEmail}`)
      console.log(`   Role: ${existingAdmin.role}`)
      console.log('\n   To update password, delete the user first or use Prisma Studio.')
      console.log('   Or update manually in the database.\n')
    } else {
      // Create admin user
      console.log('🔐 Creating admin user...')
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

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
      console.log('\n✅ You can now log in at /login\n')
    }

    // Summary
    console.log('📊 Database Summary:')
    const userCount = await prisma.user.count()
    const bookingCount = await prisma.booking.count()
    const contactCount = await prisma.contact.count()
    console.log(`   Users: ${userCount}`)
    console.log(`   Bookings: ${bookingCount}`)
    console.log(`   Contacts: ${contactCount}\n`)

  } catch (error) {
    console.error('\n❌ Error setting up database:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
      
      if (error.message.includes('P1001') || error.message.includes('Can\'t reach database server')) {
        console.error('\n💡 Tip: Check that DATABASE_URL is correct and database is accessible')
      } else if (error.message.includes('P1003') || error.message.includes('does not exist')) {
        console.error('\n💡 Tip: Run `npx prisma db push` first to create tables')
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('\n💡 Tip: Database tables don\'t exist. Run: npx prisma db push')
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupProductionDatabase()

