import { getServices } from "@/app/actions/services"; // Assuming this exists or I will verify
import { getSettings } from "@/app/actions/settings"
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export async function Footer() {
  const settings = await getSettings()
  const services = await getServices()
  const displayedServices = services.slice(0, 4)

  const currentYear = new Date().getFullYear()

  if (!settings) return null // Or some fallback

  return (
    <footer className="bg-olive text-white pt-16 pb-8 mx-[5px] mb-[5px] rounded-b-xl rounded-t-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.jpg" 
                alt={`${settings.businessName} Logo`} 
                width={280} 
                height={100} 
                className="h-28 w-auto object-contain bg-white/10 rounded-xl p-2"
              />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              {settings.metaDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/services" className="hover:text-orange transition-colors">Our Services</Link></li>
              <li><Link href="/about" className="hover:text-orange transition-colors">About Us</Link></li>
              <li><Link href="/contacts" className="hover:text-orange transition-colors">Contact</Link></li>
              <li><Link href="/booking" className="hover:text-orange transition-colors">Book Consultation</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-gold">Specialties</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {displayedServices.length > 0 ? (
                displayedServices.map(service => (
                    <li key={service.id}>
                        <Link href={`/services/${service.slug}`} className="hover:text-orange transition-colors">
                            {service.title}
                        </Link>
                    </li>
                ))
              ) : (
                <li>General Nutrition</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-gold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/80 flex flex-col items-center md:items-start">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange shrink-0" />
                <span>
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange shrink-0" />
                <span>{settings.phoneNumber}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© {currentYear} {settings.businessName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
