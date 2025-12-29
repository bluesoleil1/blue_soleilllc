import { Link } from 'react-router-dom'
import { Shield, TrendingUp, Heart, PiggyBank, ArrowRight } from 'lucide-react'

export default function Home() {
  const services = [
    {
      name: 'Term Life Insurance',
      description: 'Affordable protection for a specific period. Perfect for families and young professionals.',
      icon: Shield,
      href: '/services/term-life',
      color: 'bg-blue-soleil-navy',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    },
    {
      name: 'Permanent Life Insurance',
      description: 'Lifetime coverage with cash value accumulation. Build wealth while protecting your family.',
      icon: Heart,
      href: '/services/permanent-life',
      color: 'bg-blue-soleil-teal',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    },
    {
      name: 'Index Universal Life',
      description: 'Flexible coverage linked to market indexes. Growth potential with downside protection.',
      icon: TrendingUp,
      href: '/services/index-universal-life',
      color: 'bg-blue-soleil-gold',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    },
    {
      name: 'Index Annuities',
      description: 'Retirement income with market-linked growth. Secure your financial future.',
      icon: PiggyBank,
      href: '/services/index-annuity',
      color: 'bg-blue-soleil-orange',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow-lg leading-tight">
              Secure Your Future with{' '}
              <span className="bg-gradient-to-r from-blue-soleil-gold to-yellow-400 bg-clip-text text-transparent">
                Blue Soleil LLC
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Professional insurance and retirement planning services in Lauderhill, FL
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/booking"
                className="btn-primary inline-flex items-center justify-center group"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="btn-secondary"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-gradient-to-b from-blue-soleil-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Our Insurance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive insurance solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Link
                  key={service.name}
                  to={service.href}
                  className="card-modern group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className={`${service.color} absolute top-4 right-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-soleil-navy mb-3 group-hover:text-blue-soleil-teal transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    <div className="mt-4 flex items-center text-blue-soleil-navy font-semibold text-sm group-hover:text-blue-soleil-teal transition-colors">
                      Learn more
                      <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Why Choose Blue Soleil LLC?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted partner in financial security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center card-gradient p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="icon-container bg-gradient-to-br from-blue-soleil-gold to-yellow-500 mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-soleil-navy" />
              </div>
              <h3 className="text-2xl font-bold text-blue-soleil-navy mb-4">
                Expert Guidance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Years of experience helping clients secure their financial future
              </p>
            </div>

            <div className="text-center card-gradient p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="icon-container bg-gradient-to-br from-blue-soleil-teal to-teal-600 mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-soleil-navy mb-4">
                Personalized Service
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored solutions that fit your unique needs and goals
              </p>
            </div>

            <div className="text-center card-gradient p-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="icon-container bg-gradient-to-br from-blue-soleil-orange to-orange-500 mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-soleil-navy mb-4">
                Local Expertise
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Serving Lauderhill, FL and surrounding communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-lg">
            Ready to Secure Your Future?
          </h2>
          <p className="text-xl md:text-2xl text-gray-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Schedule a free consultation today and let us help you find the perfect insurance solution.
          </p>
          <Link
            to="/booking"
            className="btn-primary inline-flex items-center group"
          >
            Book Your Free Consultation
            <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}
