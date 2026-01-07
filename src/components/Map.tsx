import { ArrowRight } from 'lucide-react'

export default function Map() {
  const address = '1381 NW 40th Ave, Lauderhill, FL 33313'
  const encodedAddress = encodeURIComponent(address)
  
  // Use Google Maps embed URL that doesn't require API key
  // This uses the standard Google Maps embed which works without API key
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`

  return (
    <div className="w-full">
      <div className="w-full h-96 rounded-2xl overflow-hidden shadow-large bg-gray-200">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          title="Blue Soleil LLC Location"
          className="rounded-2xl w-full h-full"
        />
      </div>
      <div className="mt-6 text-center p-6 bg-blue-soleil-light rounded-xl">
        <p className="text-gray-700 mb-3 font-semibold">
          <span className="text-blue-soleil-navy">Address:</span> {address}
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-soleil-navy hover:text-blue-soleil-teal font-bold transition-colors group"
        >
          Get Directions
          <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  )
}
