import { useState } from 'react'
import { bookingApi } from '../lib/api'
import { ServiceType } from '../types'
import { Calendar, CheckCircle } from 'lucide-react'

export default function Booking() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '' as ServiceType | '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const serviceTypes = [
    { value: ServiceType.TERM_LIFE, label: 'Term Life Insurance' },
    { value: ServiceType.PERMANENT_LIFE, label: 'Permanent Life Insurance' },
    { value: ServiceType.INDEX_UNIVERSAL_LIFE, label: 'Index Universal Life' },
    { value: ServiceType.INDEX_ANNUITY, label: 'Index Annuity' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!formData.serviceType) {
      setError('Please select a service type')
      setLoading(false)
      return
    }

    try {
      await bookingApi.create({
        ...formData,
        serviceType: formData.serviceType,
      })
      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        serviceType: '' as ServiceType | '',
        message: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-shadow-lg">
              Book Your Free Consultation
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 leading-relaxed">
              Fill out the form below and we'll get back to you to schedule your consultation.
            </p>
          </div>
        </div>
      </section>

      <div className="section-padding bg-gradient-to-b from-blue-soleil-light to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {success && (
            <div className="mb-8 p-6 bg-green-50 border-2 border-green-400 rounded-2xl animate-scale-in">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xl font-bold text-green-800 mb-2">Booking Submitted Successfully!</h2>
                  <p className="text-green-700 leading-relaxed">
                    Thank you for your interest. We'll contact you shortly to confirm your consultation appointment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-400 rounded-2xl animate-scale-in">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="card-modern p-8 md:p-10 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="input-modern"
                >
                  <option value="">Select a service...</option>
                  {serviceTypes.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your needs or any questions you have..."
                  className="input-modern resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:-translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-soleil-navy mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-gray-600 animate-fade-in">
            <p className="text-sm">
              By submitting this form, you agree to be contacted by Blue Soleil LLC regarding your consultation request.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
