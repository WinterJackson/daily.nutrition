import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { WhatsAppFloat } from "@/components/WhatsAppFloat"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow mx-[5px]">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
