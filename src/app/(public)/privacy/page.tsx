import { getSettings } from "@/app/actions/settings"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Daily Nutrition",
  description: "Privacy Policy and data protection practices for Daily Nutrition in compliance with the Kenya Data Protection Act, 2019.",
}

export default async function PrivacyPolicyPage() {
  const settings = await getSettings()
  const businessName = settings?.businessName || "Daily Nutrition"
  const email = settings?.contactEmail || "privacy@edwaknutrition.co.ke"
  const address = settings?.address || "Nairobi, Kenya"

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal relative pb-16 pt-32">
      <AnimatedBackground variant="subtle" />
      
      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-off-white mb-4">Privacy Policy</h1>
          <p className="text-olive/80 dark:text-olive/60 font-medium">Last Updated: March 2026</p>
        </div>

        <div className="prose prose-lg max-w-none text-charcoal/80 dark:text-off-white/80 space-y-8 bg-white/80 dark:bg-white/5 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-100 dark:border-white/10">
          
          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">1. Introduction</h2>
            <p>
              Welcome to <strong>{businessName}</strong>. This Privacy Policy sets out how we collect, use, process, and protect your personal data when you use our website, services, or interact with us. We are committed to safeguarding your privacy in strict compliance with the <strong>Kenya Data Protection Act, 2019 (DPA)</strong> and its attendant regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">2. Data Controller</h2>
            <p>
              For the purposes of the DPA, <strong>{businessName}</strong> is the Data Controller. This means we determine the purpose and means of processing your personal data.<br /><br />
              <strong>Official Address:</strong> {address}<br />
              <strong>Data Protection Officer (DPO) Contact:</strong> {email}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">3. Data We Collect</h2>
            <p>We may collect and process the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Identity Data:</strong> First name, last name, title, date of birth, and gender.</li>
              <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone/mobile numbers.</li>
              <li><strong>Health & Wellness Data:</strong> Nutritional goals, dietary preferences, medical history relevant to our consultation services (processed strictly with explicit consent as sensitive personal data under Section 44 of the DPA).</li>
              <li><strong>Financial Data:</strong> Bank account and payment card details (processed securely via regulated third-party payment gateways handling 16% VAT).</li>
              <li><strong>Technical Data:</strong> Internet Protocol (IP) address, browser type and version, time zone setting, operating system, and platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">4. How We Collect Your Data</h2>
            <p>
              We collect data through:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Direct interactions:</strong> When you book a consultation, fill out inquiries, or subscribe to our newsletter.</li>
              <li><strong>Automated technologies:</strong> Through cookies, server logs, and similar technologies (see our Cookie Policy for details).</li>
              <li><strong>Third parties:</strong> Analytics providers, advertising networks, and payment processors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">5. Lawful Basis for Processing</h2>
            <p>Under Section 30 of the DPA, we will only process your personal data where we have a lawful basis. These include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Consent:</strong> Where you have provided unambiguous, informed consent (especially for health data).</li>
              <li><strong>Contractual Necessity:</strong> To fulfill our obligations under any contract we have with you (e.g., providing consultation services).</li>
              <li><strong>Legal Obligation:</strong> Where we need to comply with a legal or regulatory obligation in Kenya.</li>
              <li><strong>Legitimate Interests:</strong> For our legitimate business interests, provided they do not override your fundamental rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">6. Purpose of Processing</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Register you as a new client and manage your appointments.</li>
              <li>Deliver tailored health and nutrition consultancy services.</li>
              <li>Process payments, including calculation and remittance of applicable taxes (such as 16% VAT).</li>
              <li>Send administrative notifications, security alerts, and support messages.</li>
              <li>Improve our website, services, marketing, and client relationships using AI-assisted tools where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">7. Data Sharing and Transfers</h2>
            <p>
              We may share your personal data with strictly vetted third-party service providers (e.g., hosting providers, payment processors, email API services like Resend, and AI service providers like Google Gemini) who act as Data Processors.
            </p>
            <p className="mt-4">
              <strong>Cross-Border Transfers:</strong> If we transfer your personal data outside Kenya, we ensure a similar degree of protection is afforded to it in accordance with Section 48 of the DPA, either by transferring it to countries with adequate data protection laws or by utilizing standard contractual clauses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">8. Data Security</h2>
            <p>
              We have implemented robust security measures to prevent your personal data from being accidentally lost, used, accessed in an unauthorized way, altered, or disclosed. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>AES-256-GCM Encryption:</strong> For stored sensitive configuration and data.</li>
              <li><strong>JWT Validations:</strong> To securely manage client sessions.</li>
              <li><strong>Access Controls:</strong> Limiting access to personal data to employees, agents, and contractors who have a strict business need to know and are subject to a duty of confidentiality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">9. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. By default, client consultation records are kept securely for a minimum duration as mandated by Kenyan health and corporate statutes before secure deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">10. Your Data Subject Rights</h2>
            <p>Under Part IV of the Kenya Data Protection Act, you possess the following rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Right to be Informed:</strong> To know how your data is being used.</li>
              <li><strong>Right of Access:</strong> To access your personal data in our possession.</li>
              <li><strong>Right to Rectification:</strong> To request correction of false or misleading data.</li>
              <li><strong>Right to Erasure:</strong> To request the deletion of your data summarily ("Right to be Forgotten").</li>
              <li><strong>Right to Object:</strong> To object to the processing of all or part of your personal data.</li>
              <li><strong>Right to Data Portability:</strong> To receive your data in a structured, commonly used, machine-readable format.</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at <strong>{email}</strong>. We will respond within the statutory timeframe of 14 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">11. Automated Decision Making and Profiling</h2>
            <p>
              We do not use your personal data for automated decision-making that produces legal effects concerning you or similarly significantly affects you without human intervention. Our AI integrations (e.g., content drafting) do not profile individual users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">12. Office of the Data Protection Commissioner (ODPC)</h2>
            <p>
              If you believe our processing of your personal data infringes data protection laws, you have a legal right to lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong> in Kenya. However, we would appreciate the chance to deal with your concerns before you approach the ODPC.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-olive dark:text-brand-green mb-4">13. Changes to this Privacy Policy</h2>
            <p>
              We keep our Privacy Policy under regular review. Any changes will be posted on this page with an updated revision date. If significant changes occur regarding how we treat your personal data, we will notify you prominently via email or notice on our platform.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
