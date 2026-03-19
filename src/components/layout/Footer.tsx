import { getServices } from "@/app/actions/services"; // Assuming this exists or I will verify
import { getSettings } from "@/app/actions/settings";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function Footer() {
  const settings = await getSettings()
  const services = await getServices()
  // User requested all services to be displayed without omitting any
  const displayedServices = services

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
                width={480} 
                height={200} 
                className="h-50 w-auto object-contain bg-white/10 rounded-xl p-2"
              />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              {settings.metaDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/services" className="hover:text-orange transition-colors">Our Services</Link></li>
              <li><Link href="/about" className="hover:text-orange transition-colors">About Us</Link></li>
              <li><Link href="/contacts" className="hover:text-orange transition-colors">Contact</Link></li>
              <li><Link href="/booking" className="hover:text-orange transition-colors">Book Consultation</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-white">Specialties</h4>
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
            <h4 className="font-semibold text-lg text-white">Contact Us</h4>
            <ul className="space-y-3 mb-14 text-sm text-white/80 flex flex-col items-center md:items-start">
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

            {/* Social Icons — Orange, directly under Contact Us */}
            <div className="flex gap-3 justify-center md:justify-start pt-2">
              {settings.facebookUrl && (
                <Link href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-orange hover:text-orange/80 transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {settings.instagramUrl && (
                <Link href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-orange hover:text-orange/80 transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {settings.twitterUrl && (
                <Link href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-orange hover:text-orange/80 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              )}
              {settings.linkedinUrl && (
                <Link href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-orange hover:text-orange/80 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© {currentYear} {settings.businessName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
