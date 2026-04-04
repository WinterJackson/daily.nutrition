import { getSettings } from "@/app/actions/settings"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const metadata: Metadata = {
  title: "Cookie Policy | Edwak Nutrition",
  description: "Detailed information about how Edwak Nutrition uses cookies and tracking technologies.",
}

export default async function CookiePolicyPage() {
  const settings = await getSettings()
  const businessName = settings?.businessName || "Edwak Nutrition"

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal relative pb-16 pt-32">
      <AnimatedBackground variant="subtle" />
      
      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal dark:text-off-white mb-4">Cookie Policy</h1>
          <p className="text-sm md:text-base text-olive/80 dark:text-olive/60 font-medium">Last Updated: March 2026</p>
        </div>

        <div className="prose prose-lg max-w-none text-charcoal/80 dark:text-off-white/80 space-y-8 bg-white/80 dark:bg-white/5 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/10">
          
          {settings?.cookiePolicyContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {settings.cookiePolicyContent}
            </ReactMarkdown>
          ) : (
            <>
              {/* Fallback configuration */}
              <section>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-olive dark:text-brand-green mb-4">1. What are Cookies?</h2>
                <p>
                  Cookies are small data files that are seamlessly placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to securely make their websites work, evaluate operational efficiency, and provide structured reporting information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-olive dark:text-brand-green mb-4">2. Why We Use Cookies</h2>
                <p>
                  <strong>{businessName}</strong> uses cookies to recognize your browser or device, strictly map your authorization sessions, learn more about your health and nutritional interests, and provide you with essential features and services. 
                </p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-olive dark:text-brand-green mb-4">3. Classifications of Cookies We Utilize</h2>
                <p>Cookies strategically record your visit to our website and the overarching digital campaigns.</p>
              </section>

              <section>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-olive dark:text-brand-green mb-4">4. Managing Your Cookie Preferences</h2>
                <p>
                  You can assertively set your browser to strictly refuse all or some browser cookies, or to explicitly alert you when websites actively set or methodically access cookies.
                </p>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
