import { getActiveInsuranceProviders } from "@/app/actions/insurance"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/Accordion"

// Static FAQs that don't depend on DB data
const staticFaqs = [
    {
        question: "What should I prepare for my first consultation?",
        answer: "Please have any recent blood work (within the last 3-6 months), a list of current medications, and a 3-day food diary if possible. This helps us build a more accurate nutrition plan for you.",
    },
    {
        question: "How long are the sessions?",
        answer: "Initial consultations typically last 60–75 minutes to allow for a comprehensive assessment. Follow-up sessions are usually 30–45 minutes.",
    },
    {
        question: "Can I switch between virtual and in-person?",
        answer: "Yes! You can choose the format that works best for you for each appointment. Many clients prefer an initial in-person visit followed by virtual check-ins.",
    },
    {
        question: "What happens if I need to cancel?",
        answer: "We require at least 24 hours notice for cancellations or rescheduling. Late cancellations may be subject to a fee.",
    },
]

/**
 * Server component — fetches live insurance providers so the FAQ answer is
 * always accurate without requiring a code change or redeploy.
 */
export async function FAQSection() {
    const insuranceProviders = await getActiveInsuranceProviders()

    // Build the insurance FAQ answer dynamically based on current accepted providers
    const insuranceFaq = {
        question: "Do you accept insurance?",
        answer:
            insuranceProviders.length > 0
                ? `Yes! We currently accept ${insuranceProviders.map(p => p.name).join(" and ")} at our partner clinic. Clients who visit us for in-person consultations can pay their insurer directly — the clinic then settles our fee monthly. Please contact your insurer to verify your outpatient nutrition benefit before your appointment. Note: the free Discovery Call and online meal plan purchases are self-pay only.`
                : "We currently operate on a cash and M-Pesa basis for most services. We can provide detailed invoices that you may submit to your insurance provider for reimbursement, depending on your policy. Contact us for more information.",
    }

    // Insert insurance FAQ after the first question (preparation) — most relevant position
    const allFaqs = [staticFaqs[0], insuranceFaq, ...staticFaqs.slice(1)]

    return (
        <div className="w-full max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-center text-olive dark:text-off-white mb-8">
                Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="w-full">
                {allFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-base md:text-lg text-left text-olive dark:text-off-white hover:text-brand-green hover:no-underline">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
