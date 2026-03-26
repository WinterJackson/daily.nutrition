import { getSettings } from "@/app/actions/settings"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Metadata } from "next"

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
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-off-white mb-4">Cookie Policy</h1>
          <p className="text-olive/80 dark:text-olive/60 font-medium">Last Updated: March 2026</p>
        </div>

        <div className="prose prose-lg max-w-none text-charcoal/80 dark:text-off-white/80 space-y-8 bg-white/80 dark:bg-white/5 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/10">
          
          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">1. What are Cookies?</h2>
            <p>
              Cookies are small data files that are seamlessly placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to securely make their websites work, evaluate operational efficiency, and provide structured reporting information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">2. Why We Use Cookies</h2>
            <p>
              <strong>{businessName}</strong> uses cookies to recognize your browser or device, strictly map your authorization sessions, learn more about your health and nutritional interests, and provide you with essential features and services. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">3. Classifications of Cookies We Utilize</h2>
            
            <div className="space-y-6 mt-6">
              <div className="border-l-4 border-orange pl-4">
                <h3 className="text-xl font-semibold text-charcoal dark:text-off-white mb-2">Essential / Strictly Necessary Cookies</h3>
                <p>
                  These cookies are strictly required for the foundational operation of our website. They include, for example, JWT (`session_token`) cookies that dynamically enable you to log into secure areas of our administrative dashboard, seamlessly use a booking cart, or securely execute electronic billing. Our in-memory rate-limiter systems may also utilize strict IP caching techniques complementary to this.
                </p>
              </div>

              <div className="border-l-4 border-olive pl-4">
                <h3 className="text-xl font-semibold text-charcoal dark:text-off-white mb-2">Analytical / Performance Cookies</h3>
                <p>
                  These allow us to securely recognize and accurately count the number of visitors and systematically evaluate how visitors pivot around our website when utilizing it. This substantially helps us to improve the way our website works, for example, by ensuring that users are efficiently finding the booking forms and articles they are actively looking for.
                </p>
              </div>

              <div className="border-l-4 border-gold pl-4">
                <h3 className="text-xl font-semibold text-charcoal dark:text-off-white mb-2">Functionality Cookies</h3>
                <p>
                  These are structurally utilized to comprehensively recognize you when you pivot back to our website. This securely enables us to organically personalize our content for you, contextually greet you by name, and reliably remember your preferences (for example, your choice of language, region, or light/dark mode preference via the `next-themes` module).
                </p>
              </div>

              <div className="border-l-4 border-charcoal/20 pl-4">
                <h3 className="text-xl font-semibold text-charcoal dark:text-off-white mb-2">Targeting Cookies</h3>
                <p>
                  These cookies strategically record your visit to our website, the exact pages you have selectively visited, and the embedded links you reliably followed. We will inherently use this aggregated information to make our website and the overarching digital campaigns more strictly relevant to your distinct nutritional interests.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">4. Managing Your Cookie Preferences</h2>
            <p>
              You can assertively set your browser to strictly refuse all or some browser cookies, or to explicitly alert you when websites actively set or methodically access cookies. If you selectively disable or completely refuse cookies, please be emphatically advised that some parts of this website may become severely inaccessible or functionally fail to operate properly (e.g., the secure administrative backend will fundamentally refuse access without a `session_token`).
            </p>
            <p className="mt-4">
              To comprehensively discover how to systematically manage cookies on wildly popular browsers, please strictly review the official documentation provided by:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Apple Safari</li>
              <li>Microsoft Edge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">5. Revisions to this Policy</h2>
            <p>
              We systematically reserve the right to dynamically alter this Cookie Policy at any chronological point in time. Any prospective modulations will become emphatically effective exactly upon our digital publication of the completely revised document on our platform.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
