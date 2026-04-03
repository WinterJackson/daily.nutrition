import { getSettings } from "@/app/actions/settings"

export async function StructuredData() {
  const settings = await getSettings()
  if (!settings) return null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://edwaknutrition.co.ke"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": settings.businessName || "Edwak Nutrition",
    "image": settings.ogImageUrl || `${baseUrl}/images/og-image.jpg`,
    "@id": baseUrl,
    "url": baseUrl,
    "telephone": settings.phoneNumber,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": settings.address.split(',')[0] || "Nairobi",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": settings.latitude,
      "longitude": settings.longitude
    },
    "sameAs": [
      settings.facebookUrl,
      settings.instagramUrl,
      settings.twitterUrl,
      settings.linkedinUrl
    ].filter(Boolean),
    "priceRange": "$$"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
