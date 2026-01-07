/**
 * Email Service for Blue Soleil LLC
 * Uses Resend API for reliable email delivery
 * Compatible with Vercel serverless functions
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

interface ContactEmailData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

interface BookingEmailData {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType: string
  message?: string
}

class EmailService {
  private apiKey: string
  private from: string
  private replyTo: string
  private adminEmail: string
  private skipInDev: boolean

  constructor() {
    // Server-side only - these won't be exposed to client
    this.apiKey = process.env.RESEND_API_KEY || ''
    this.from = process.env.EMAIL_FROM || 'Blue Soleil LLC <info@bluesoleilfl.com>'
    this.replyTo = process.env.EMAIL_REPLY_TO || 'info@bluesoleilfl.com'
    // Use info@bluesoleilfl.com for receiving notifications
    // admin@bluesoleilfl.com is only for login
    this.adminEmail = process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL || 'info@bluesoleilfl.com'
    this.skipInDev = process.env.SKIP_EMAIL_IN_DEV === 'true' && process.env.NODE_ENV !== 'production'
  }

  /**
   * Send email using Resend API
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Skip email in development if configured
    if (this.skipInDev) {
      console.log('📧 [DEV] Email skipped:', options.subject, 'to', options.to)
      return { success: true, messageId: 'dev-skipped' }
    }

    if (!this.apiKey) {
      console.error('❌ RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text || this.htmlToText(options.html),
          reply_to: options.replyTo || this.replyTo,
          cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
          bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email')
      }

      return { success: true, messageId: data.id }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send contact form notification
   */
  async sendContactNotification(data: ContactEmailData): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #4a9a9e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e3a5f; }
            .value { margin-top: 5px; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #d4a52e; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${this.escapeHtml(data.name)}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${this.escapeHtml(data.email)}</a></div>
              </div>
              ${data.phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${data.phone}">${this.escapeHtml(data.phone)}</a></div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${this.escapeHtml(data.subject)}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${this.formatMessage(data.message)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: this.adminEmail,
      subject: `New Contact: ${data.subject}`,
      html,
      replyTo: data.email,
    })
  }

  /**
   * Send booking notification
   */
  async sendBookingNotification(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    const serviceTypeLabels: Record<string, string> = {
      TERM_LIFE: 'Term Life Insurance',
      PERMANENT_LIFE: 'Permanent Life Insurance',
      INDEX_UNIVERSAL_LIFE: 'Index Universal Life',
      INDEX_ANNUITY: 'Index Annuity',
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #4a9a9e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e3a5f; }
            .value { margin-top: 5px; }
            .service-badge { display: inline-block; background: #d4a52e; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #d4a52e; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Booking Request</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Client Name:</div>
                <div class="value">${this.escapeHtml(data.firstName)} ${this.escapeHtml(data.lastName)}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${this.escapeHtml(data.email)}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${data.phone}">${this.escapeHtml(data.phone)}</a></div>
              </div>
              <div class="field">
                <div class="label">Service Type:</div>
                <div class="value">
                  <span class="service-badge">${serviceTypeLabels[data.serviceType] || data.serviceType}</span>
                </div>
              </div>
              ${data.message ? `
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${this.formatMessage(data.message)}</div>
              </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: this.adminEmail,
      subject: `New Booking: ${serviceTypeLabels[data.serviceType] || data.serviceType}`,
      html,
      replyTo: data.email,
    })
  }

  /**
   * Send confirmation email to customer
   */
  async sendBookingConfirmation(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    const serviceTypeLabels: Record<string, string> = {
      TERM_LIFE: 'Term Life Insurance',
      PERMANENT_LIFE: 'Permanent Life Insurance',
      INDEX_UNIVERSAL_LIFE: 'Index Universal Life',
      INDEX_ANNUITY: 'Index Annuity',
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #4a9a9e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; margin-bottom: 20px; }
            .cta-button { display: inline-block; background: #d4a52e; color: #1e3a5f; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✓</div>
              <h1>Thank You for Your Interest!</h1>
            </div>
            <div class="content">
              <p>Dear ${this.escapeHtml(data.firstName)},</p>
              <p>Thank you for requesting a consultation for <strong>${serviceTypeLabels[data.serviceType] || data.serviceType}</strong>.</p>
              <p>We've received your request and one of our experienced agents will contact you within 24 hours to schedule your free consultation.</p>
              <p>If you have any immediate questions, please don't hesitate to contact us:</p>
              <ul>
                <li>Phone: <a href="tel:7542653030">(754) 265-3030</a></li>
                <li>Email: <a href="mailto:info@bluesoleilfl.com">info@bluesoleilfl.com</a></li>
              </ul>
              <p style="text-align: center;">
                <a href="https://bluesoleil.com" class="cta-button">Visit Our Website</a>
              </p>
            </div>
            <div class="footer">
              <p>Blue Soleil LLC<br>
              1381 NW 40th Ave, Lauderhill, FL 33313</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.email,
      subject: 'Thank You for Your Consultation Request',
      html,
    })
  }

  // Helper methods
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  private formatMessage(message: string): string {
    return this.escapeHtml(message).replace(/\n/g, '<br>')
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export types
export type { EmailOptions, ContactEmailData, BookingEmailData }

