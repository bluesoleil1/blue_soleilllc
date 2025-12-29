import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { bookingApi } from '../lib/api'
import type { Booking, BookingStatus } from '../types'
import { BookingStatus as BookingStatusEnum } from '../types'
import { Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Admin() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        navigate('/login')
        return
      }
      loadBookings()
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingApi.getAll()
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
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
          <h1 className="text-5xl font-bold gradient-text mb-3">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 font-medium">Manage bookings and appointments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-xl animate-scale-in">
            <span className="font-semibold">{error}</span>
          </div>
        )}

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
              <p className="text-lg text-gray-600 font-semibold">No bookings yet</p>
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
      </div>
    </div>
  )
}
