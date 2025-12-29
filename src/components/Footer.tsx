import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-navy to-blue-soleil-teal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-blue-soleil-gold">Blue Soleil LLC</h3>
            <p className="text-gray-200 mb-6 leading-relaxed">
              Professional insurance and retirement planning services in Lauderhill, FL.
            </p>
            <div className="space-y-3 text-sm text-gray-200">
              <div className="flex items-start group">
                <div className="bg-blue-soleil-gold/20 p-2 rounded-lg mr-3 group-hover:bg-blue-soleil-gold/30 transition-colors">
                  <MapPin className="w-5 h-5 text-blue-soleil-gold" />
                </div>
                <span className="pt-1.5">1381 NW 40th Ave, Lauderhill, FL 33313</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-2xl font-bold mb-6 text-blue-soleil-gold">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/contact', label: 'Contact' },
                { to: '/booking', label: 'Book Appointment' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-200 hover:text-blue-soleil-gold transition-all duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-soleil-gold mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold mb-6 text-blue-soleil-gold">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start group">
                <div className="bg-blue-soleil-gold/20 p-2 rounded-lg mr-3 group-hover:bg-blue-soleil-gold/30 transition-colors flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-soleil-gold" />
                </div>
                <div className="pt-1">
                  <div className="text-gray-200">
                    Cell: <a href="tel:7542653030" className="hover:text-blue-soleil-gold transition-colors font-semibold">(754) 265-3030</a>
                  </div>
                  <div className="text-gray-200">
                    Office: <a href="tel:9545301529" className="hover:text-blue-soleil-gold transition-colors font-semibold">(954) 530-1529</a>
                  </div>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="bg-blue-soleil-gold/20 p-2 rounded-lg mr-3 group-hover:bg-blue-soleil-gold/30 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-soleil-gold" />
                </div>
                <a href="mailto:info@bluesoleil.com" className="text-gray-200 hover:text-blue-soleil-gold transition-colors font-semibold pt-1">
                  info@bluesoleil.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-200">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Blue Soleil LLC. All rights reserved.
            </p>
            <span className="hidden md:inline text-gray-400">•</span>
            <a
              href="https://www.techactionstudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-200 hover:text-blue-soleil-gold transition-all duration-300 group"
            >
              <span className="text-sm">Powered by</span>
              <img
                src="/images/tech-action-logo.svg"
                alt="Tech Action Studio"
                className="h-12 w-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
