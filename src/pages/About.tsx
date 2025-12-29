import { Link } from 'react-router-dom'
import { Shield, Heart, TrendingUp, Users, Award, ArrowRight } from 'lucide-react'

export default function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-shadow-lg">
              About <span className="bg-gradient-to-r from-blue-soleil-gold to-yellow-400 bg-clip-text text-transparent">Blue Soleil LLC</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in insurance and retirement planning
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        {/* Agent Helping Photo Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-large transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/images/insurance.jpg"
                alt="Professional insurance agent helping family in office"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-soleil-navy/20 to-transparent"></div>
            </div>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Personalized Service You Can Trust
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              At Blue Soleil LLC, we believe in building lasting relationships with our clients. 
              Our experienced agents take the time to understand your unique financial situation, 
              goals, and concerns to provide personalized insurance and retirement planning solutions.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Whether you're planning for your family's future, preparing for retirement, or looking 
              to protect your business, we're here to guide you every step of the way.
            </p>
            <Link
              to="/booking"
              className="btn-primary inline-flex items-center group"
            >
              Schedule a Consultation
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Our Mission */}
        <div className="card-gradient p-10 md:p-16 mb-20 text-center animate-scale-in">
          <div className="max-w-4xl mx-auto">
            <div className="icon-container bg-gradient-to-br from-blue-soleil-navy to-blue-soleil-teal mx-auto mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              To empower individuals and families in Lauderhill, FL and surrounding communities 
              with comprehensive insurance and retirement planning solutions that provide financial 
              security, peace of mind, and a pathway to achieving their long-term goals.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Why Choose Blue Soleil LLC?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Excellence in every interaction
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center card-gradient p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="icon-container bg-gradient-to-br from-blue-soleil-navy to-blue-soleil-teal mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-soleil-navy mb-4">
                Experienced Team
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our knowledgeable agents have years of experience helping clients navigate 
                complex insurance and retirement planning decisions.
              </p>
            </div>

            <div className="text-center card-gradient p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="icon-container bg-gradient-to-br from-blue-soleil-teal to-teal-600 mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-soleil-navy mb-4">
                Trusted Protection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We work with reputable insurance carriers to provide you with reliable coverage 
                and peace of mind for you and your loved ones.
              </p>
            </div>

            <div className="text-center card-gradient p-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="icon-container bg-gradient-to-br from-blue-soleil-gold to-yellow-500 mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-soleil-navy mb-4">
                Client-Focused
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your success is our priority. We take a personalized approach to ensure 
                every solution is tailored to your specific needs and goals.
              </p>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="card-modern p-10 md:p-16 mb-20">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Comprehensive Insurance Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored solutions for every stage of life
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="flex items-start p-6 rounded-xl hover:bg-blue-soleil-light transition-all duration-300 group">
              <div className="bg-blue-soleil-navy/10 p-3 rounded-xl mr-4 group-hover:bg-blue-soleil-navy group-hover:scale-110 transition-all duration-300">
                <Shield className="w-6 h-6 text-blue-soleil-navy group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-blue-soleil-navy mb-2">Term Life Insurance</h3>
                <p className="text-gray-600 leading-relaxed">Affordable protection for your most critical years</p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-xl hover:bg-blue-soleil-light transition-all duration-300 group">
              <div className="bg-blue-soleil-teal/10 p-3 rounded-xl mr-4 group-hover:bg-blue-soleil-teal group-hover:scale-110 transition-all duration-300">
                <Heart className="w-6 h-6 text-blue-soleil-teal group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-blue-soleil-navy mb-2">Permanent Life Insurance</h3>
                <p className="text-gray-600 leading-relaxed">Lifetime coverage with cash value accumulation</p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-xl hover:bg-blue-soleil-light transition-all duration-300 group">
              <div className="bg-blue-soleil-gold/10 p-3 rounded-xl mr-4 group-hover:bg-blue-soleil-gold group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-blue-soleil-gold group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-blue-soleil-navy mb-2">Index Universal Life</h3>
                <p className="text-gray-600 leading-relaxed">Market-linked growth with downside protection</p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-xl hover:bg-blue-soleil-light transition-all duration-300 group">
              <div className="bg-blue-soleil-orange/10 p-3 rounded-xl mr-4 group-hover:bg-blue-soleil-orange group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-blue-soleil-orange group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-blue-soleil-navy mb-2">Index Annuities</h3>
                <p className="text-gray-600 leading-relaxed">Guaranteed retirement income with growth potential</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center text-blue-soleil-navy font-bold text-lg hover:text-blue-soleil-teal transition-colors group"
            >
              Learn more about our services
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-br from-blue-soleil-navy via-blue-soleil-teal to-blue-soleil-navy text-white rounded-3xl p-10 md:p-16 text-center overflow-hidden shadow-large">
          <div className="absolute inset-0 pattern-bg"></div>
          <div className="relative z-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-lg">
              Ready to Secure Your Future?
            </h2>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Let our experienced team help you find the right insurance and retirement planning 
              solutions for your unique needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="btn-primary inline-flex items-center justify-center group"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
