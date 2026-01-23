import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-olive text-white pt-16 pb-8 mx-[5px] mb-[5px] rounded-b-xl rounded-t-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.jpg" 
                alt="Daily Nutrition Logo" 
                width={280} 
                height={100} 
                className="h-28 w-auto object-contain bg-white/10 rounded-xl p-2"
              />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Empowering individuals with personalized, evidence-based nutrition support for cancer, diabetes, and gut health.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/services" className="hover:text-orange transition-colors">Our Services</Link></li>
              <li><Link href="/about" className="hover:text-orange transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-orange transition-colors">Contact</Link></li>
              <li><Link href="/booking" className="hover:text-orange transition-colors">Book Consultation</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-gold">Specialties</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Oncology Nutrition</li>
              <li>Diabetes Management</li>
              <li>Digestive Health (IBS/GERD)</li>
              <li>Weight Management</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-lg text-gold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/80 flex flex-col items-center md:items-start">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange shrink-0" />
                <span>
                  3rd Parklands Avenue, Parklands<br />
                  Muhoho Avenue, South C
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange shrink-0" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange shrink-0" />
                <span>info@dailynutrition.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Daily Nutrition. All rights reserved.</p>
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
