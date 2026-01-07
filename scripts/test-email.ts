// Test SMTP and IMAP connectivity
// Run with: npx tsx scripts/test-email.ts

import nodemailer from 'nodemailer'
import Imap from 'imap'

async function testSMTP() {
  console.log('\n📧 Testing SMTP Connection...\n')

  const smtpConfig = {
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'info@bluesoleilfl.com',
      pass: process.env.SMTP_PASS || '',
    },
  }

  console.log('SMTP Config:')
  console.log(`  Host: ${smtpConfig.host}`)
  console.log(`  Port: ${smtpConfig.port}`)
  console.log(`  User: ${smtpConfig.auth.user}`)
  console.log(`  Secure: ${smtpConfig.secure}\n`)

  try {
    const transporter = nodemailer.createTransport(smtpConfig)

    // Verify connection
    console.log('Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Send test email
    console.log('Sending test email...')
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Blue Soleil LLC <info@bluesoleilfl.com>',
      to: process.env.EMAIL_REPLY_TO || 'info@bluesoleilfl.com',
      subject: 'Test Email from Blue Soleil Website',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
      text: 'This is a test email to verify SMTP configuration.',
    })

    console.log('✅ Test email sent successfully!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Response: ${info.response}\n`)

    return { success: true }
  } catch (error) {
    console.error('❌ SMTP Error:', error instanceof Error ? error.message : error)
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        console.error('   → Check SMTP_USER and SMTP_PASS credentials')
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('   → Check SMTP_HOST and SMTP_PORT')
      } else if (error.message.includes('ETIMEDOUT')) {
        console.error('   → Check network connection or firewall')
      }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function testIMAP() {
  console.log('\n📬 Testing IMAP Connection...\n')

  const imapConfig = {
    user: process.env.IMAP_USER || 'info@bluesoleilfl.com',
    password: process.env.IMAP_PASS || '',
    host: process.env.IMAP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.IMAP_PORT || '993'),
    tls: process.env.IMAP_SECURE === 'true',
    tlsOptions: { rejectUnauthorized: false },
  }

  console.log('IMAP Config:')
  console.log(`  Host: ${imapConfig.host}`)
  console.log(`  Port: ${imapConfig.port}`)
  console.log(`  User: ${imapConfig.user}`)
  console.log(`  TLS: ${imapConfig.tls}\n`)

  return new Promise<{ success: boolean; error?: string }>((resolve) => {
    const imap = new Imap(imapConfig)

    imap.once('ready', () => {
      console.log('✅ IMAP connection successful!\n')
      imap.end()
      resolve({ success: true })
    })

    imap.once('error', (err: Error) => {
      console.error('❌ IMAP Error:', err.message)
      if (err.message.includes('Invalid credentials')) {
        console.error('   → Check IMAP_USER and IMAP_PASS credentials')
      } else if (err.message.includes('ECONNREFUSED')) {
        console.error('   → Check IMAP_HOST and IMAP_PORT')
      } else if (err.message.includes('ETIMEDOUT')) {
        console.error('   → Check network connection or firewall')
      }
      resolve({ success: false, error: err.message })
    })

    imap.once('end', () => {
      console.log('IMAP connection closed\n')
    })

    try {
      imap.connect()
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
}

async function main() {
  console.log('='.repeat(50))
  console.log('Email Configuration Test')
  console.log('='.repeat(50))

  // Load environment variables
  const dotenv = await import('dotenv')
  dotenv.config()

  const smtpResult = await testSMTP()
  const imapResult = await testIMAP()

  console.log('\n' + '='.repeat(50))
  console.log('Test Summary')
  console.log('='.repeat(50))
  console.log(`SMTP: ${smtpResult.success ? '✅ PASS' : '❌ FAIL'}`)
  if (!smtpResult.success) {
    console.log(`   Error: ${smtpResult.error}`)
  }
  console.log(`IMAP: ${imapResult.success ? '✅ PASS' : '❌ FAIL'}`)
  if (!imapResult.success) {
    console.log(`   Error: ${imapResult.error}`)
  }
  console.log('='.repeat(50) + '\n')
}

main().catch(console.error)

