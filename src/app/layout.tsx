import { getSettings } from "@/app/actions/settings";
import { CookieConsent } from "@/components/CookieConsent";
import { StructuredData } from "@/components/seo/structured-data";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edwaknutrition.co.ke";
  const defaultTitle = settings?.pageTitle || "Edwak Nutrition | Professional Nutrition Consultancy";
  const defaultDesc = settings?.metaDescription || "Expert nutrition care for cancer, diabetes, and gut health.";
  const ogImage = settings?.ogImageUrl || `${baseUrl}/images/og-image.jpg`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${settings?.businessName || "Edwak Nutrition"}`,
    },
    description: defaultDesc,
    keywords: settings?.keywords?.split(',').map(k => k.trim()) || ["nutrition", "dietitian", "Nairobi", "Kenya"],
    authors: [{ name: settings?.businessName || "Edwak Nutrition" }],
    creator: settings?.businessName || "Edwak Nutrition",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings?.businessName || "Edwak Nutrition",
    },
    formatDetection: {
      telephone: true,
    },
    openGraph: {
      type: "website",
      locale: "en_KE",
      siteName: settings?.businessName || "Edwak Nutrition",
      title: defaultTitle,
      description: defaultDesc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: defaultTitle,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: [ogImage],
    },
    robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5C6F2B" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1110" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <StructuredData />
      </head>
      <body
        className={cn(outfit.variable, inter.variable, "antialiased font-sans bg-off-white dark:bg-charcoal text-neutral-900 dark:text-neutral-50")}
        suppressHydrationWarning
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ServiceWorkerRegistration />
            {children}
            <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
