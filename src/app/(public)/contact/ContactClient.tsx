"use client"

import { ContactForm } from "@/components/contact/ContactForm"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { motion } from "framer-motion"
import { Clock, Globe, Mail, MapPin, Phone } from "lucide-react"

import { SettingsData } from "@/app/actions/settings"

interface ContactClientProps {
  settings: SettingsData
}

export default function ContactClient({ settings }: ContactClientProps) {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-off-white dark:bg-charcoal relative">
       
       {/* Animated Background */}
       <AnimatedBackground variant="nutrition" />
       
       <div className="container max-w-7xl mx-auto mt-15 px-4 sm:px-6 lg:px-8 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
             <div className="inline-block px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm text-orange font-semibold text-xs uppercase tracking-wide mb-4 border border-orange/20 shadow-sm">
                  Ready to Help
             </div>
             <h1 className="text-4xl md:text-5xl font-bold font-serif text-olive dark:text-off-white mb-4">
                Get in Touch
             </h1>
             <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto">
                Have questions or ready to book your consultation? We are here to help you start your journey.
             </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl shadow-olive/5 border border-neutral-100 dark:border-white/10"
          >
             
             {/* Contact Info Side */}
             <div className="lg:col-span-2 bg-olive text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-serif font-bold mb-8">Contact Information</h3>
                  
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/10 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="space-y-4">
                           <div>
                              <p className="font-semibold text-white mb-1">Our Location</p>
                              <p className="text-white/70 text-sm leading-relaxed">
                                 {settings.address}
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/10 shrink-0">
                             <Phone className="w-5 h-5" />
                        </div>
                        <p className="text-white/80 font-medium">{settings.phoneNumber}</p>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/10 shrink-0">
                             <Mail className="w-5 h-5" />
                        </div>
                        <p className="text-white/80 font-medium">{settings.contactEmail}</p>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/10 shrink-0">
                             <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-white/70 space-y-1">
                           <p><strong className="text-white">Virtual:</strong> Tue - Fri, 9AM - 4PM</p>
                           <p><strong className="text-white">In-Person:</strong> Mon & Wed, 9AM - 5PM</p>
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className="relative z-10 pt-8 border-t border-white/10 mt-8 flex items-center gap-3">
                    <Globe className="w-4 h-4 opacity-50" />
                    <span className="text-xs opacity-50">Remote consultations available via Zoom.</span>
                </div>
             </div>
             
             {/* Form Side */}
             <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-charcoal">
                <div className="max-w-md mx-auto w-full lg:mx-0">
                    <h3 className="text-xl font-serif font-bold text-olive dark:text-off-white mb-2">Send us a Message</h3>
                    <p className="text-neutral-500 text-sm mb-6">We usually respond within 24 hours.</p>
                    <ContactForm />
                </div>
             </div>
             
          </motion.div>

          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 h-[350px] w-full rounded-2xl overflow-hidden relative border border-neutral-200 dark:border-white/10 shadow-lg"
          >
             <iframe 
               src={`https://maps.google.com/maps?q=${encodeURIComponent(`${settings.businessName} ${settings.address}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               title="Edwak Nutrition Location - Parklands"
               className="absolute inset-0"
             />
          </motion.div>
       </div>
    </div>
  )
}
