import { useState } from 'react'
import { contactApi } from '../lib/api'
import Map from '../components/Map'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await contactApi.create(formData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-shadow-lg">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="section-padding bg-gradient-to-b from-blue-soleil-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <div className="card-modern p-8 md:p-10">
                <h2 className="text-3xl font-bold gradient-text mb-8">Send us a Message</h2>
                
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 text-green-800 rounded-xl animate-scale-in">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Thank you for your message! We'll get back to you soon.</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-xl animate-scale-in">
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="input-modern"
                    />
                  </div>

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
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-modern"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-modern"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="input-modern resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:-translate-y-0 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-soleil-navy mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="card-modern p-8 md:p-10">
                <h2 className="text-3xl font-bold gradient-text mb-8">Get in Touch</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start group p-4 rounded-xl hover:bg-blue-soleil-light transition-all duration-300">
                    <div className="icon-container bg-gradient-to-br from-blue-soleil-navy to-blue-soleil-teal mr-4 flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">Phone</h3>
                      <a href="tel:7542653030" className="text-gray-700 hover:text-blue-soleil-navy font-semibold block mb-1 transition-colors">
                        Cell: (754) 265-3030
                      </a>
                      <a href="tel:9545301529" className="text-gray-700 hover:text-blue-soleil-navy font-semibold block transition-colors">
                        Office: (954) 530-1529
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start group p-4 rounded-xl hover:bg-blue-soleil-light transition-all duration-300">
                    <div className="icon-container bg-gradient-to-br from-blue-soleil-teal to-teal-600 mr-4 flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">Email</h3>
                      <a href="mailto:info@bluesoleilfl.com" className="text-gray-700 hover:text-blue-soleil-navy font-semibold transition-colors">
                        info@bluesoleilfl.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start group p-4 rounded-xl hover:bg-blue-soleil-light transition-all duration-300">
                    <div className="icon-container bg-gradient-to-br from-blue-soleil-gold to-yellow-500 mr-4 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">Address</h3>
                      <p className="text-gray-700 leading-relaxed">
                        1381 NW 40th Ave<br />
                        Lauderhill, FL 33313
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-gradient p-6 rounded-xl">
                  <h3 className="font-bold text-xl text-blue-soleil-navy mb-4">Business Hours</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="font-semibold">Monday - Friday: <span className="font-normal">9:00 AM - 6:00 PM</span></p>
                    <p className="font-semibold">Saturday: <span className="font-normal">By Appointment</span></p>
                    <p className="font-semibold">Sunday: <span className="font-normal">Closed</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl font-bold gradient-text mb-8 text-center">Find Us</h2>
            <div className="card-modern overflow-hidden">
              <Map />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
