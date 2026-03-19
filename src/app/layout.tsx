import { CookieConsent } from "@/components/CookieConsent";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://edwaknutrition.co.ke"),
  title: {
    default: "Edwak Nutrition | Professional Nutrition Consultancy",
    template: "%s | Edwak Nutrition",
  },
  description: "Expert nutrition care for cancer, diabetes, and gut health. Virtual and in-person consultations with a registered dietitian in Nairobi, Kenya.",
  keywords: ["nutrition", "dietitian", "Nairobi", "Kenya", "cancer nutrition", "diabetes", "gut health", "weight management", "virtual consultation"],
  authors: [{ name: "Edwak Nutrition" }],
  creator: "Edwak Nutrition",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Edwak Nutrition",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Edwak Nutrition",
    title: "Edwak Nutrition | Professional Nutrition Consultancy",
    description: "Expert nutrition care for cancer, diabetes, and gut health. Virtual and in-person consultations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edwak Nutrition | Professional Nutrition Consultancy",
    description: "Expert nutrition care for cancer, diabetes, and gut health. Virtual and in-person consultations.",
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
