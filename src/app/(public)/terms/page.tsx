import { getSettings } from "@/app/actions/settings"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Edwak Nutrition",
  description: "Terms of Service, governing laws, and dispute resolution for Edwak Nutrition.",
}

export default async function TermsOfServicePage() {
  const settings = await getSettings()
  const businessName = settings?.businessName || "Edwak Nutrition"
  const email = settings?.contactEmail || "legal@edwaknutrition.co.ke"

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal relative pb-16 pt-32">
      <AnimatedBackground variant="subtle" />
      
      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-off-white mb-4">Terms of Service</h1>
          <p className="text-olive/80 dark:text-olive/60 font-medium">Last Updated: March 2026</p>
        </div>

        <div className="prose prose-lg max-w-none text-charcoal/80 dark:text-off-white/80 space-y-8 bg-white/80 dark:bg-white/5 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/10">
          
          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or utilizing the services provided by <strong>{businessName}</strong> ("Company", "we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">2. Description of Services</h2>
            <p>
              {businessName} provides premium health and wellness consultancy, nutritional planning, and digital content distribution. The specifics of the service deliverables, timelines, and costs are defined during the individual booking and consultation frameworks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">3. Medical Disclaimer</h2>
            <p>
              The nutritional content, advice, and consulting services provided on this platform are for informational and educational purposes only. They do not constitute professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider in Kenya with any questions you may have regarding a medical condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">4. Intellectual Property Rights</h2>
            <p>
              In accordance with the <strong>Kenya Copyright Act (Chapter 130 of the Laws of Kenya)</strong>, all website content, including texts, graphics, logos, images, digital downloads, data compilations, software, and AI-generated articles distributed under our brand, are the exclusive intellectual property of {businessName} and protected by Kenyan and international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">5. User Conduct</h2>
            <p>
              You agree to use the site only for lawful purposes. You are prohibited from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Engaging in any conduct that restricts or inhibits any other user from using the site.</li>
              <li>Attempting to bypass our security measures, rate-limiting (`rate-limit.ts` integrations), or API protections.</li>
              <li>Transmitting or distributing a virus, trojan, worm, or introducing any malicious code.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">6. Booking and Scheduling</h2>
            <p>
              All consultations and bookings are subject to availability. By submitting a booking request, you agree to provide accurate, current, and complete information. We reserve the right to decline or cancel a booking at our sole discretion, ensuring any pre-paid amounts are refunded appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">7. Payment Terms and Taxation</h2>
            <p>
              All fees for services are presented in Kenya Shillings (KES) or US Dollars (USD) as applicable. In strict compliance with the **Kenya Revenue Authority (KRA)** regulations, all applicable services and digital products are subject to a **16% Value Added Tax (VAT)**, which will be explicitly delineated on your final invoice.
            </p>
            <p className="mt-4">
              Payments must be made prior to the commencement of service or consultation via our approved gateways (e.g., M-PESA, Visa, Mastercard).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">8. Cancellation and Refund Policy</h2>
            <p>
              Consultations canceled at least 24 hours prior to the scheduled time will be eligible for a full refund or rescheduling. Cancellations made less than 24 hours prior may be subject to a cancellation fee equivalent to 50% of the service cost. Subscriptions for recurring digital content can be canceled at any time, but partial month refunds are not provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">9. Third-Party Links and Integrations</h2>
            <p>
              Our website may contain links to third-party websites or services (e.g., Google Calendar integrations, payment gateways) that are not owned or controlled by {businessName}. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">10. Data Protection and Privacy</h2>
            <p>
              Your use of our website is also governed by our Privacy Policy, which is fully compliant with the **Kenya Data Protection Act, 2019**. By using our services, you consent to the processing of your data as described therein.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by Kenyan law, {businessName}, its directors, employees, partners, or agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, stemming from your access to or use of the services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless {businessName} and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses resulting from your breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">13. Disclaimer of Warranties</h2>
            <p>
              Our service is provided on an "AS IS" and "AS AVAILABLE" basis. {businessName} makes no representations or warranties of any kind, express or implied, regarding the continuous availability, reliability, or accuracy of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">14. Dispute Resolution (Arbitration)</h2>
            <p>
              Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by arbitration in accordance with the <strong>Arbitration Act, 1995 (Chapter 49 of the Laws of Kenya)</strong>. The arbitration shall be conducted by a single arbitrator appointed by agreement between the parties or, failing agreement within 14 days, appointed by the Chairman of the Chartered Institute of Arbitrators (Kenya Branch). The seat of arbitration shall be Nairobi, Kenya, and the language shall be English.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">15. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the **Republic of Kenya**, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">16. Amendments to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide formal notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
            <p className="mt-4">
              <strong>Contact:</strong> For any questions regarding these Terms, contact {email}.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
