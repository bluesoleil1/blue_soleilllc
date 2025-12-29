import { useParams, Link } from 'react-router-dom'
import { Shield, Heart, TrendingUp, PiggyBank, Check, ArrowRight } from 'lucide-react'

const serviceDetails: Record<string, {
  name: string
  icon: any
  color: string
  image: string
  description: string
  benefits: string[]
  whoNeedsIt: string[]
  howItWorks: string
}> = {
  'term-life': {
    name: 'Term Life Insurance',
    icon: Shield,
    color: 'bg-blue-soleil-navy',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop',
    description: 'Term life insurance provides affordable coverage for a specific period, typically 10, 20, or 30 years. It\'s designed to provide financial protection during your most critical years, such as when raising a family or paying off a mortgage.',
    benefits: [
      'Lower premiums compared to permanent insurance',
      'Flexible term lengths to match your needs',
      'Option to convert to permanent coverage',
      'Tax-free death benefit for beneficiaries',
      'Simple and straightforward coverage',
    ],
    whoNeedsIt: [
      'Young families with children',
      'Homeowners with mortgages',
      'Business owners with loans',
      'Anyone needing temporary coverage',
      'People on a budget who need maximum coverage',
    ],
    howItWorks: 'You choose a coverage amount and term length. You pay premiums for the duration of the term. If you pass away during the term, your beneficiaries receive the death benefit tax-free. If you outlive the term, coverage ends unless you convert to permanent insurance.',
  },
  'permanent-life': {
    name: 'Permanent Life Insurance',
    icon: Heart,
    color: 'bg-blue-soleil-teal',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
    description: 'Permanent life insurance provides lifetime coverage with a cash value component that grows over time. It combines death benefit protection with a savings element, making it a powerful tool for estate planning and wealth accumulation.',
    benefits: [
      'Lifetime coverage guaranteed',
      'Cash value that grows tax-deferred',
      'Borrow against cash value',
      'Estate planning benefits',
      'Fixed premiums that never increase',
    ],
    whoNeedsIt: [
      'People who want lifetime coverage',
      'Those planning for estate taxes',
      'Individuals seeking tax-advantaged savings',
      'High net worth individuals',
      'Anyone wanting to leave a legacy',
    ],
    howItWorks: 'You pay fixed premiums that are higher than term insurance. Part of your premium goes toward the death benefit, and part goes into a cash value account that grows over time. The cash value grows tax-deferred and can be borrowed against or withdrawn.',
  },
  'index-universal-life': {
    name: 'Index Universal Life Insurance',
    icon: TrendingUp,
    color: 'bg-blue-soleil-gold',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop',
    description: 'Index Universal Life (IUL) insurance offers flexible premiums and death benefits, with cash value growth linked to market indexes like the S&P 500. It provides upside potential while protecting against market downturns with a floor.',
    benefits: [
      'Market-linked growth potential',
      'Downside protection with a floor',
      'Flexible premium payments',
      'Tax-advantaged cash value growth',
      'Ability to adjust death benefit',
    ],
    whoNeedsIt: [
      'People wanting market exposure with protection',
      'Those seeking flexible premium payments',
      'Individuals looking for tax-advantaged growth',
      'People who want to supplement retirement income',
      'Those wanting to maximize cash value growth',
    ],
    howItWorks: 'Your cash value is linked to a market index. When the index performs well, your cash value grows. When the index performs poorly, your cash value is protected by a floor (typically 0%). You can adjust premiums and death benefits as your needs change.',
  },
  'index-annuity': {
    name: 'Index Annuities',
    icon: PiggyBank,
    color: 'bg-blue-soleil-orange',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop',
    description: 'Index annuities provide retirement income with growth potential linked to market indexes. They offer a balance between growth and protection, making them ideal for retirement planning and generating guaranteed income.',
    benefits: [
      'Guaranteed income stream for life',
      'Market-linked growth potential',
      'Principal protection',
      'Tax-deferred growth',
      'No contribution limits',
    ],
    whoNeedsIt: [
      'People approaching retirement',
      'Those seeking guaranteed income',
      'Individuals wanting market exposure with protection',
      'People who have maxed out 401(k) contributions',
      'Those planning for long-term care needs',
    ],
    howItWorks: 'You make a lump-sum payment or series of payments. Your money grows based on the performance of a market index, with downside protection. When you\'re ready, you can convert the annuity into a guaranteed income stream for life or a specific period.',
  },
}

export default function ServiceDetail() {
  const { serviceType } = useParams<{ serviceType: string }>()
  const service = serviceType ? serviceDetails[serviceType] : null

  if (!service) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
        <Link to="/services" className="text-blue-soleil-navy hover:underline">
          View all services
        </Link>
      </div>
    )
  }

  const Icon = service.icon

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className={`${service.color} absolute inset-0 bg-opacity-85 flex items-center justify-center`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mr-6 shadow-lg">
                <Icon className="w-16 h-16 md:w-20 md:h-20" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg">{service.name}</h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">{service.description}</p>
          </div>
        </div>
      </section>

      <div className="section-padding bg-gradient-to-b from-blue-soleil-light to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fade-in">
            <Link 
              to="/services" 
              className="inline-flex items-center text-blue-soleil-navy hover:text-blue-soleil-teal font-semibold transition-colors group"
            >
              <ArrowRight className="w-5 h-5 mr-2 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Services
            </Link>
          </div>

          <div className="card-modern p-8 md:p-12 mb-10 animate-slide-up">
            <div className="flex items-center mb-6">
              <div className={`${service.color} w-1 h-12 rounded-full mr-4`}></div>
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">How It Works</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed pl-5">{service.howItWorks}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="card-modern p-8 md:p-10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center mb-6">
                <div className="icon-container bg-gradient-to-br from-blue-soleil-gold to-yellow-500 mr-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">Key Benefits</h2>
              </div>
              <ul className="space-y-4">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="w-2 h-2 bg-blue-soleil-gold rounded-full mr-4 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                    <span className="text-gray-700 text-lg leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-modern p-8 md:p-10 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center mb-6">
                <div className="icon-container bg-gradient-to-br from-blue-soleil-teal to-teal-600 mr-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">Who Needs It</h2>
              </div>
              <ul className="space-y-4">
                {service.whoNeedsIt.map((item, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="w-2 h-2 bg-blue-soleil-teal rounded-full mr-4 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                    <span className="text-gray-700 text-lg leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden shadow-large animate-fade-in">
            <div className="absolute inset-0 pattern-bg"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-shadow-lg">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Schedule a free consultation to learn more about {service.name} and see if it's right for you.
              </p>
              <Link
                to="/booking"
                className="btn-primary inline-flex items-center group"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
