import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { bookingApi, contactApi, emailApi } from '../lib/api'
import type { Booking, BookingStatus, Contact, Email } from '../types'
import { BookingStatus as BookingStatusEnum } from '../types'
import { Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Clock, Eye, Trash2, MessageSquare, LogOut, User, Send, Inbox } from 'lucide-react'

type TabType = 'bookings' | 'contacts' | 'emails'

export default function Admin() {
  const { isAuthenticated, isAdmin, loading: authLoading, user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showComposeEmail, setShowComposeEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    html: '',
    text: '',
    cc: '',
    bcc: '',
  })
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        console.log('Admin page: Not authenticated or not admin', { isAuthenticated, isAdmin })
        navigate('/login')
        return
      }
      // Ensure we have a token before loading data
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found, redirecting to login')
        navigate('/login')
        return
      }
      console.log('Admin page: Loading data for authenticated admin')
      loadData()
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      // Load bookings, contacts, and emails in parallel
      const results = await Promise.allSettled([loadBookings(), loadContacts(), loadEmails()])
      
      // Check for errors
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const types = ['bookings', 'contacts', 'emails']
          console.error(`Failed to load ${types[index]}:`, result.reason)
        }
      })
    } catch (err) {
      console.error('Error in loadData:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadEmails = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Loading emails...')
      const data = await emailApi.getAll()
      console.log('Emails loaded:', data)
      setEmails(data.emails || [])
    } catch (err) {
      console.error('Failed to load emails:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load emails'
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        console.error('Authentication error - token may be expired or invalid')
      }
      setEmails([])
    }
  }

  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || (!emailForm.html && !emailForm.text)) {
      setError('Please fill in all required fields (To, Subject, and Message)')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const recipients = emailForm.to.split(',').map(e => e.trim())
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        setError(`Invalid email address: ${email}`)
        return
      }
    }

    try {
      setSendingEmail(true)
      setError('')

      const result = await emailApi.send({
        to: recipients.length === 1 ? recipients[0] : recipients,
        subject: emailForm.subject,
        html: emailForm.html || emailForm.text.replace(/\n/g, '<br>'),
        text: emailForm.text || emailForm.html.replace(/<[^>]*>/g, ''),
        cc: emailForm.cc ? emailForm.cc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
        bcc: emailForm.bcc ? emailForm.bcc.split(',').map(e => e.trim()).filter(Boolean) : undefined,
      })

      if (result.success) {
        setEmailForm({ to: '', subject: '', html: '', text: '', cc: '', bcc: '' })
        setShowComposeEmail(false)
        await loadEmails()
        setError('') // Clear any previous errors
      } else {
        setError('Failed to send email')
      }
    } catch (err) {
      console.error('Failed to send email:', err)
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Loading bookings...')
      const data = await bookingApi.getAll()
      console.log('Bookings loaded:', data)
      setBookings(data.bookings || [])
      if (data.bookings && data.bookings.length === 0) {
        console.log('No bookings found in database')
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings'
      
      // Check if it's an authentication error
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        const authError = 'Authentication failed. Please log out and log back in.'
        setError(authError)
        console.error('Authentication error - token may be expired or invalid')
      } else {
        setError(`Failed to load bookings: ${errorMessage}`)
      }
      setBookings([])
    }
  }

  const loadContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Loading contacts...')
      console.log('Token exists:', !!token)
      console.log('Token preview:', token.substring(0, 20) + '...')
      
      const data = await contactApi.getAll()
      console.log('Contacts loaded:', data)
      console.log('Contacts count:', data.contacts?.length || 0)
      
      setContacts(data.contacts || [])
      if (data.contacts && data.contacts.length === 0) {
        console.log('No contacts found in database')
      }
    } catch (err) {
      console.error('Failed to load contacts:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contacts'
      
      // Check if it's an authentication error
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        const authError = 'Authentication failed. Please log out and log back in.'
        setError(authError)
        console.error('Authentication error - token may be expired or invalid')
        // Optionally redirect to login after a delay
        setTimeout(() => {
          if (!localStorage.getItem('token')) {
            navigate('/login')
          }
        }, 3000)
      } else {
        setError(`Failed to load contacts: ${errorMessage}`)
      }
      setContacts([])
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await bookingApi.updateStatus(id, status)
      await loadBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      await contactApi.delete(id)
      await loadContacts()
      if (selectedContact?.id === id) {
        setShowModal(false)
        setSelectedContact(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
    }
  }

  const viewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setShowModal(true)
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-soleil-light via-white to-blue-soleil-light flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-soleil-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-soleil-light via-white to-blue-soleil-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold gradient-text mb-3">Admin Dashboard</h1>
              <p className="text-lg text-gray-600 font-medium">
                Manage bookings and contact messages
                {user && (
                  <span className="ml-3 text-sm text-blue-soleil-navy flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {user.email} ({user.role})
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-soleil-navy text-white rounded-lg hover:bg-blue-soleil-teal transition-colors font-semibold"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-xl animate-scale-in">
            <span className="font-semibold">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 font-semibold transition-colors text-sm md:text-base ${
              activeTab === 'bookings'
                ? 'text-blue-soleil-navy border-b-2 border-blue-soleil-navy'
                : 'text-gray-600 hover:text-blue-soleil-navy'
            }`}
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            <span className="hidden sm:inline">Bookings</span>
            <span className="sm:hidden">Book</span>
            <span className="ml-1">({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-3 font-semibold transition-colors text-sm md:text-base ${
              activeTab === 'contacts'
                ? 'text-blue-soleil-navy border-b-2 border-blue-soleil-navy'
                : 'text-gray-600 hover:text-blue-soleil-navy'
            }`}
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            <span className="hidden sm:inline">Messages</span>
            <span className="sm:hidden">Msg</span>
            <span className="ml-1">({contacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-3 font-semibold transition-colors text-sm md:text-base ${
              activeTab === 'emails'
                ? 'text-blue-soleil-navy border-b-2 border-blue-soleil-navy'
                : 'text-gray-600 hover:text-blue-soleil-navy'
            }`}
          >
            <Mail className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            <span className="hidden sm:inline">Emails</span>
            <span className="sm:hidden">Email</span>
            <span className="ml-1">({emails.length})</span>
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-soleil-light to-white">
              <h2 className="text-2xl font-bold text-blue-soleil-navy">Bookings</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="bg-blue-soleil-navy/10 px-4 py-2 rounded-lg">
                  <span className="text-sm font-semibold text-blue-soleil-navy">
                    Total: <span className="text-blue-soleil-navy">{bookings.length}</span>
                  </span>
                </div>
                <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                  <span className="text-sm font-semibold text-yellow-800">
                    Pending: <span className="text-yellow-900">{bookings.filter(b => b.status === 'PENDING').length}</span>
                  </span>
                </div>
              </div>
            </div>

          {bookings.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-soleil-light rounded-2xl mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600 font-semibold mb-4">No bookings yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Bookings will appear here when customers submit booking requests through the website.
              </p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-soleil-navy text-white rounded-lg hover:bg-blue-soleil-teal transition-colors font-semibold"
              >
                Refresh
              </button>
            </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-soleil-light to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-blue-soleil-light/50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {booking.firstName} {booking.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-2 text-blue-soleil-teal" />
                            {booking.email}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-blue-soleil-teal" />
                            {booking.phone}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {booking.serviceType.replace(/_/g, ' ')}
                          </div>
                          {booking.message && (
                            <div className="text-xs text-gray-500 mt-1 flex items-start">
                              <FileText className="w-3 h-3 mr-1 mt-0.5 text-blue-soleil-teal" />
                              <span className="line-clamp-2">{booking.message}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-2">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => updateStatus(booking.id, BookingStatusEnum.CONFIRMED)}
                                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors transform hover:scale-110"
                                  title="Confirm"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => updateStatus(booking.id, BookingStatusEnum.CANCELLED)}
                                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors transform hover:scale-110"
                                  title="Cancel"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => updateStatus(booking.id, BookingStatusEnum.COMPLETED)}
                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-110"
                                title="Mark as Completed"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-soleil-light to-white">
              <h2 className="text-2xl font-bold text-blue-soleil-navy">Contact Messages</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="bg-blue-soleil-navy/10 px-4 py-2 rounded-lg">
                  <span className="text-sm font-semibold text-blue-soleil-navy">
                    Total: <span className="text-blue-soleil-navy">{contacts.length}</span>
                  </span>
                </div>
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-soleil-light rounded-2xl mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg text-gray-600 font-semibold">No messages yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-soleil-light to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Message Preview
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-blue-soleil-light/50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{contact.name}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-2 text-blue-soleil-teal" />
                            <a href={`mailto:${contact.email}`} className="hover:text-blue-soleil-navy">
                              {contact.email}
                            </a>
                          </div>
                          {contact.phone && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-blue-soleil-teal" />
                              <a href={`tel:${contact.phone}`} className="hover:text-blue-soleil-navy">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">{contact.subject}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                            {contact.message}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => viewContact(contact)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-110"
                              title="View Message"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteContact(contact.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors transform hover:scale-110"
                              title="Delete Message"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Emails Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            {/* Compose Email Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-soleil-navy">Email Management</h2>
              <button
                onClick={() => setShowComposeEmail(!showComposeEmail)}
                className="px-4 py-2 bg-blue-soleil-navy text-white rounded-lg hover:bg-blue-soleil-teal transition-colors font-semibold flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {showComposeEmail ? 'Cancel' : 'Compose Email'}
              </button>
            </div>

            {/* Compose Email Form */}
            {showComposeEmail && (
              <div className="card-modern p-6 md:p-8 animate-slide-up">
                <h3 className="text-xl font-bold text-blue-soleil-navy mb-6">Compose Email</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To * <span className="text-xs text-gray-500">(comma-separated for multiple)</span>
                    </label>
                    <input
                      type="text"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                      placeholder="recipient@example.com"
                      className="w-full input-modern"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CC <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={emailForm.cc}
                        onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                        placeholder="cc@example.com"
                        className="w-full input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        BCC <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={emailForm.bcc}
                        onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                        placeholder="bcc@example.com"
                        className="w-full input-modern"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      placeholder="Email subject"
                      className="w-full input-modern"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message * <span className="text-xs text-gray-500">(HTML supported, max 100KB)</span>
                    </label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">
                        {emailForm.html.length + emailForm.text.length} characters
                      </span>
                      {(emailForm.html.length + emailForm.text.length) > 100000 && (
                        <span className="text-xs text-red-600 font-semibold">
                          Content too long! Maximum 100KB allowed.
                        </span>
                      )}
                    </div>
                    <textarea
                      id="email-html"
                      value={emailForm.html}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 100000) {
                          setEmailForm({ ...emailForm, html: value })
                        }
                      }}
                      rows={12}
                      placeholder="Type your message here... HTML is supported."
                      className="w-full input-modern resize-none text-sm"
                      maxLength={100000}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Tip: Use HTML for rich formatting, or plain text for simple messages.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowComposeEmail(false)
                        setEmailForm({ to: '', subject: '', html: '', text: '', cc: '', bcc: '' })
                        setError('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendEmail}
                      disabled={sendingEmail || !emailForm.to || !emailForm.subject || (!emailForm.html && !emailForm.text)}
                      className="px-6 py-2 bg-blue-soleil-navy text-white rounded-lg hover:bg-blue-soleil-teal transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sent Emails List */}
            <div className="card-modern overflow-hidden animate-slide-up">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-soleil-light to-white">
                <h2 className="text-2xl font-bold text-blue-soleil-navy">Sent Emails</h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="bg-blue-soleil-navy/10 px-4 py-2 rounded-lg">
                    <span className="text-sm font-semibold text-blue-soleil-navy">
                      Total: <span className="text-blue-soleil-navy">{emails.length}</span>
                    </span>
                  </div>
                </div>
              </div>

              {emails.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-soleil-light rounded-2xl mb-6">
                    <Inbox className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-600 font-semibold mb-4">No emails sent yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Click "Compose Email" to send your first email.
                  </p>
                  <button
                    onClick={() => setShowComposeEmail(true)}
                    className="px-4 py-2 bg-blue-soleil-navy text-white rounded-lg hover:bg-blue-soleil-teal transition-colors font-semibold"
                  >
                    Compose Email
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-soleil-light to-gray-50">
                      <tr>
                        <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-blue-soleil-navy uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emails.map((email) => (
                        <tr key={email.id} className="hover:bg-blue-soleil-light/50 transition-colors">
                          <td className="px-4 md:px-6 py-5">
                            <div className="text-sm text-gray-900">
                              <Mail className="w-4 h-4 inline mr-2 text-blue-soleil-teal" />
                              <span className="break-words">{email.to}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-5">
                            <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                              {email.subject}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                                email.status === 'SENT'
                                  ? 'bg-green-100 text-green-800'
                                  : email.status === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {email.status === 'SENT' && <CheckCircle className="w-4 h-4 mr-1" />}
                              {email.status === 'FAILED' && <XCircle className="w-4 h-4 mr-1" />}
                              {email.status === 'PENDING' && <Clock className="w-4 h-4 mr-1" />}
                              <span>{email.status}</span>
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {new Date(email.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 md:px-6 py-5 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedContact({
                                  id: email.id,
                                  name: 'Sent Email',
                                  email: email.to,
                                  subject: email.subject,
                                  message: email.text || email.html.replace(/<[^>]*>/g, ''),
                                  createdAt: email.createdAt,
                                })
                                setShowModal(true)
                              }}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-110"
                              title="View Email"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Message/Email Modal */}
        {showModal && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="sticky top-0 bg-gradient-to-r from-blue-soleil-navy to-blue-soleil-teal text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedContact.subject}</h2>
                    <p className="text-blue-soleil-light text-sm md:text-base">
                      {selectedContact.name !== 'Sent Email' ? `From: ${selectedContact.name}` : `To: ${selectedContact.email}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedContact(null)
                    }}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900 break-words">
                      <a href={`mailto:${selectedContact.email}`} className="text-blue-soleil-navy hover:underline">
                        {selectedContact.email}
                      </a>
                    </p>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-900">
                        <a href={`tel:${selectedContact.phone}`} className="text-blue-soleil-navy hover:underline">
                          {selectedContact.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Message</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-soleil-teal overflow-x-auto">
                      {selectedContact.message.includes('<') && selectedContact.message.includes('>') ? (
                        <div 
                          className="text-gray-900 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedContact.message }}
                        />
                      ) : (
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedContact(null)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  {selectedContact.name !== 'Sent Email' && (
                    <button
                      onClick={() => {
                        deleteContact(selectedContact.id)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
