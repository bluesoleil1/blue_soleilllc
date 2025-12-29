import { Link } from 'react-router-dom'
import { Shield, Heart, TrendingUp, PiggyBank, ArrowRight } from 'lucide-react'

export default function Services() {
  const services = [
    {
      name: 'Term Life Insurance',
      description: 'Term life insurance provides coverage for a specific period, typically 10, 20, or 30 years. It offers affordable protection and is ideal for young families, homeowners with mortgages, or anyone who needs coverage for a specific timeframe.',
      features: [
        'Affordable premiums',
        'Flexible term lengths',
        'Convertible to permanent coverage',
        'Death benefit protection',
      ],
      icon: Shield,
      href: '/services/term-life',
      color: 'bg-blue-soleil-navy',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    },
    {
      name: 'Permanent Life Insurance',
      description: 'Permanent life insurance provides lifetime coverage with a cash value component that grows over time. It combines protection with a savings element, making it a valuable tool for estate planning and wealth accumulation.',
      features: [
        'Lifetime coverage',
        'Cash value accumulation',
        'Tax-deferred growth',
        'Estate planning benefits',
      ],
      icon: Heart,
      href: '/services/permanent-life',
      color: 'bg-blue-soleil-teal',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    },
    {
      name: 'Index Universal Life',
      description: 'Index Universal Life (IUL) insurance offers flexible premiums and death benefits, with cash value growth linked to market indexes. It provides upside potential while protecting against market downturns.',
      features: [
        'Market-linked growth potential',
        'Downside protection',
        'Flexible premiums',
        'Tax-advantaged cash value',
      ],
      icon: TrendingUp,
      href: '/services/index-universal-life',
      color: 'bg-blue-soleil-gold',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    },
    {
      name: 'Index Annuities',
      description: 'Index annuities provide retirement income with growth potential linked to market indexes. They offer a balance between growth and protection, making them ideal for retirement planning.',
      features: [
        'Guaranteed income stream',
        'Market-linked growth',
        'Principal protection',
        'Tax-deferred growth',
      ],
      icon: PiggyBank,
      href: '/services/index-annuity',
      color: 'bg-blue-soleil-orange',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-shadow-lg">
              Our Insurance Services
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Comprehensive insurance solutions to protect your family and secure your financial future.
              Each product is designed to meet specific needs and goals.
            </p>
          </div>
        </div>
      </section>

      <div className="section-padding bg-gradient-to-b from-blue-soleil-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={service.name}
                  className={`card-modern animate-scale-in ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:flex`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="md:w-2/5 relative h-80 md:h-auto overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className={`${service.color} absolute top-6 left-6 p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="md:w-3/5 p-8 md:p-10">
                    <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
                      {service.name}
                    </h2>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">{service.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start group">
                          <div className="w-2 h-2 bg-blue-soleil-gold rounded-full mr-3 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                          <span className="text-gray-700 leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={service.href}
                      className="inline-flex items-center text-blue-soleil-navy font-bold text-lg hover:text-blue-soleil-teal transition-colors group"
                    >
                      Learn more
                      <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 text-center animate-fade-in">
            <div className="card-gradient p-10 max-w-2xl mx-auto">
              <p className="text-xl text-gray-700 mb-8 font-semibold">
                Not sure which service is right for you?
              </p>
              <Link
                to="/booking"
                className="btn-primary inline-flex items-center group"
              >
                Schedule a Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
