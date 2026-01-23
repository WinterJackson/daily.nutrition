"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/Accordion"

const faqs = [
  {
    question: "What should I prepare for my first consultation?",
    answer: "Please have any recent blood work (within the last 3-6 months), a list of current medications, and a 3-day food diary if possible. This helps us build a more accurate nutrition plan for you."
  },
  {
    question: "Do you accept insurance?",
    answer: "We currently operate on a cash/mobile money basis. However, we can provide detailed invoices that you may be able to submit to your insurance provider for reimbursement depending on your policy."
  },
  {
    question: "How long are the sessions?",
    answer: "Initial consultations typically last 60-75 minutes to allow for a comprehensive assessment. Follow-up sessions are usually 30-45 minutes."
  },
  {
    question: "Can I switch between virtual and in-person?",
    answer: "Yes! You can choose the format that works best for you for each appointment. Many clients prefer an initial in-person visit followed by virtual check-ins."
  },
  {
    question: "What happens if I need to cancel?",
    answer: "We require at least 24 hours notice for cancellations or rescheduling. Late cancellations may be subject to a fee."
  }
]

export function FAQSection() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-2xl font-serif font-bold text-center text-olive dark:text-off-white mb-8">
        Frequently Asked Questions
      </h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-olive dark:text-off-white hover:text-brand-green hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
