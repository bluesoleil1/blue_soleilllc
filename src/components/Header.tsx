import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, isAdmin, logout } = useAuth()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'About Us', href: '/about' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navigation */}
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center group">
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              {/* Circular gradient border with nuanced brand colors */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-gold p-[3px] group-hover:from-blue-soleil-teal group-hover:via-blue-soleil-gold group-hover:to-blue-soleil-orange transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:p-[4px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2">
                  <img
                    src="/images/logo.jpg"
                    alt="Blue Soleil LLC"
                    className="h-full w-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-semibold transition-all duration-300 relative ${
                  isActive(item.href)
                    ? 'text-blue-soleil-navy'
                    : 'text-gray-700 hover:text-blue-soleil-navy'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-soleil-gold to-yellow-500 rounded-full"></span>
                )}
              </Link>
            ))}
            <Link
              to="/booking"
              className="bg-gradient-to-r from-blue-soleil-gold to-yellow-500 text-blue-soleil-navy px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 hover:scale-105"
            >
              Book Appointment
            </Link>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm font-semibold text-blue-soleil-navy hover:text-blue-soleil-teal transition-colors px-3 py-2 rounded-lg hover:bg-blue-soleil-light"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-gray-700 hover:text-blue-soleil-navy transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-soleil-navy to-blue-soleil-teal text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-soleil-light hover:text-blue-soleil-navy'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full bg-gradient-to-r from-blue-soleil-gold to-yellow-500 text-blue-soleil-navy px-4 py-3 rounded-xl text-base font-bold text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Book Appointment
            </Link>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-blue-soleil-light transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
