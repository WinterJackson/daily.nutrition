import { Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface InquiryReceivedProps {
  clientName: string;
  service?: string;
  branding: EmailBrandingData;
}

export const InquiryReceivedEmail = ({
  clientName = "Client",
  service,
  branding
}: InquiryReceivedProps) => {
  const previewText = `We received your inquiry - Edwak Nutrition`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading={`Thank You, ${clientName}!`}
    >
      <Text className="text-black text-[14px] leading-[24px]">
        We have received your inquiry {service && `regarding ${service}`} and will get back to you within 24-48 hours.
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        In the meantime, feel free to explore our services or follow us on social media for nutrition tips.
      </Text>
      
      <Section className="bg-orange/5 p-6 rounded-lg my-6 border border-orange/20">
        <Text className="m-0 text-orange font-bold uppercase text-xs mb-2">
            Need urgent assistance?
        </Text>
        <Text className="m-0 text-lg font-semibold text-charcoal">
            Call us directly at <a href="tel:+254700000000" className="text-orange no-underline">+254 700 000 000</a>
        </Text>
      </Section>
    </BrandedEmailLayout>
  );
};

export default InquiryReceivedEmail;
