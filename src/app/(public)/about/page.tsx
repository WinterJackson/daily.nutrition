import { getSettings } from "@/app/actions/settings"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { CheckCircle2, Quote } from "lucide-react"
import { AboutClient } from "./AboutClient"

export default async function AboutPage() {
  const settings = await getSettings()
  const profileImageUrl = settings?.profileImageUrl || "/edna-portrait.png"

  return (
    <div className="pt-24 pb-16 min-h-screen bg-off-white dark:bg-charcoal overflow-hidden relative">
       
       {/* Animated Background */}
       <AnimatedBackground variant="nutrition" />
       
       <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center mb-24">
             <AboutClient profileImageUrl={profileImageUrl} />
          </div>
          
          {/* Credentials */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-neutral-100 dark:border-white/10 mb-16">
             <h3 className="text-xl font-semibold text-olive dark:text-off-white mb-6">Qualifications & Expertise</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Registered Dietitian (MSc. Nutrition & Dietetics)",
                  "Oncology Nutrition Specialist",
                  "Diabetes Educator Specialist", // Removed "Certified" per feedback
                  "8+ Years Clinical Experience",
                  "Member, Nutrition Association of Kenya", // Updated per feedback
                  "Evidence-Based Practice Advocate"
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-green mt-0.5 shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-300">{item}</span>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Philosophy Section */}
          <section className="bg-gradient-to-br from-olive/5 to-soft-green/5 dark:from-white/5 dark:to-white/[0.02] rounded-2xl p-8 md:p-12 relative overflow-hidden">
             <Quote className="absolute top-6 left-6 text-olive/10 dark:text-white/5 w-24 h-24 -z-0" />
             <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-brand-green">My Philosophy</h3>
                <p className="text-2xl md:text-3xl text-olive dark:text-off-white leading-relaxed font-serif">
                  "I realized there is no <span className="text-orange">one-size-fits-all</span> approach when it comes to healthy lifestyle. I work one-on-one with my patients to devise comprehensive nutrition programs tailored specifically to their needs."
                </p>
             </div>
          </section>
          
       </div>
    </div>
  )
}
