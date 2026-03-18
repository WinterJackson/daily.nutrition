import { Hr, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminContactAlertEmailProps {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  branding: EmailBrandingData;
}

export const AdminContactAlertEmail = ({
  name,
  email,
  phone,
  service,
  message,
  branding,
}: AdminContactAlertEmailProps) => {
  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={`New Inquiry from ${name}`}
      heading="New Contact Inquiry"
    >
      <Section className="bg-gray-50 p-4 rounded-md my-4 border border-gray-100">
        <Text className="m-0 font-bold text-gray-700">Name</Text>
        <Text className="m-0 mb-2 text-gray-600">{name}</Text>

        <Text className="m-0 font-bold text-gray-700">Email</Text>
        <Text className="m-0 mb-2 text-gray-600">
          <a href={`mailto:${email}`} className="text-brand underline">
            {email}
          </a>
        </Text>

        <Text className="m-0 font-bold text-gray-700">Phone</Text>
        <Text className="m-0 mb-2 text-gray-600">{phone || "Not provided"}</Text>

        <Text className="m-0 font-bold text-gray-700">Service Interest</Text>
        <Text className="m-0 text-gray-600">{service || "General Inquiry"}</Text>
      </Section>

      <Hr className="border-gray-200 my-4" />

      <Section className="bg-white p-4 rounded-md border border-gray-100">
        <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-2 tracking-wider">
          Message
        </Text>
        <Text className="m-0 text-[14px] leading-[24px] text-black" style={{ whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </Section>

      <Text className="text-[12px] text-gray-400 text-center mt-6">
        This inquiry was submitted via the website contact form.
      </Text>
    </BrandedEmailLayout>
  );
};

export default AdminContactAlertEmail;
