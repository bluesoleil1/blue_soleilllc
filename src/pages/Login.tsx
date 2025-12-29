import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LogIn, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Input validation on client side
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedPassword = password.trim()

      if (!trimmedEmail || !trimmedPassword) {
        setError('Email and password are required')
        setLoading(false)
        return
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      await login(trimmedEmail, trimmedPassword)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-soleil-light via-white to-blue-soleil-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-soleil-navy to-blue-soleil-teal rounded-2xl mb-6 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Sign in to your account</h2>
          <p className="text-gray-600 font-medium">Admin access only</p>
        </div>

        <div className="card-modern p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 text-red-800 rounded-xl animate-scale-in">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                placeholder="admin@bluesoleil.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern"
                placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-blue-soleil-navy hover:text-blue-soleil-teal font-semibold transition-colors group">
            <ArrowRight className="w-5 h-5 mr-2 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
