import { getActiveInsuranceProviders } from "@/app/actions/insurance"
import { Building2, ExternalLink, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

/**
 * A server component that renders the accepted insurance providers section.
 * Used in the Footer, Services page, and individual service detail sidebars.
 * Renders nothing when there are no active providers — never shows a broken empty state.
 *
 * @param variant "footer" | "banner" | "sidebar"
 *   footer  — compact inline list for the footer column
 *   banner  — full-width section for the services page
 *   sidebar — compact card for the service detail sidebar
 */
export async function InsuranceAcceptedSection({
    variant = "banner",
}: {
    variant?: "footer" | "banner" | "sidebar"
}) {
    const providers = await getActiveInsuranceProviders()
    if (providers.length === 0) return null

    // ── Footer variant ─────────────────────────────────────────────────────
    if (variant === "footer") {
        return (
            <div className="space-y-4 text-center md:text-left">
                <h4 className="font-semibold text-lg md:text-xl text-white flex items-center gap-2 justify-center md:justify-start">
                    <Shield className="w-4 h-4 text-orange shrink-0" />
                    Insurance Accepted
                </h4>
                <div className="space-y-3">
                    {providers.map(p => (
                        <div key={p.id} className="flex items-center gap-3 justify-center md:justify-start">
                            {p.logoUrl ? (
                                <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                    <Image
                                        src={p.logoUrl}
                                        alt={p.name}
                                        width={28}
                                        height={28}
                                        className="object-contain w-6 h-6"
                                    />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-orange" />
                                </div>
                            )}
                            <div className="text-left">
                                {p.websiteUrl ? (
                                    <a
                                        href={p.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-white/80 hover:text-orange transition-colors flex items-center gap-1"
                                    >
                                        {p.name}
                                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                ) : (
                                    <span className="text-sm text-white/80">{p.name}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                    For in-person clinical services only.
                </p>
            </div>
        )
    }

    // ── Sidebar variant ────────────────────────────────────────────────────
    if (variant === "sidebar") {
        return (
            <div className="mt-4 rounded-xl border border-brand-green/20 bg-brand-green/5 dark:bg-brand-green/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-green shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-green">
                        Insurance Accepted
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {providers.map(p => (
                        <div
                            key={p.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-charcoal rounded-lg border border-neutral-200 dark:border-white/10 shadow-sm"
                        >
                            {p.logoUrl ? (
                                <Image
                                    src={p.logoUrl}
                                    alt={p.name}
                                    width={20}
                                    height={20}
                                    className="object-contain w-4 h-4"
                                />
                            ) : (
                                <Building2 className="w-3.5 h-3.5 text-brand-green" />
                            )}
                            <span className="text-xs font-semibold text-body">{p.name}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Pay your insurer directly at our partner clinic. We settle with you monthly.{" "}
                    <Link href="/contact" className="text-brand-green hover:underline font-medium">
                        Verify your cover →
                    </Link>
                </p>
            </div>
        )
    }

    // ── Banner variant (default) ───────────────────────────────────────────
    return (
        <section className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-brand-green/15 dark:border-brand-green/20 p-8 md:p-12 shadow-sm">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange/5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                    {/* Left: heading */}
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-4">
                            <Shield className="w-3.5 h-3.5" />
                            Insurance Accepted
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold font-serif text-olive dark:text-off-white mb-3">
                            Use Your Insurance Cover
                        </h2>
                        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-lg">
                            We work with leading insurance providers. Clients visiting our partner clinic for{" "}
                            <strong>in-person consultations</strong> can pay directly with their insurance — no
                            out-of-pocket expense. Contact us to verify your specific cover before booking.
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3">
                            Note: Insurance applies to paid clinical services only. The free Discovery Call and
                            online meal plan orders are self-pay.
                        </p>
                    </div>

                    {/* Right: provider cards */}
                    <div className="flex flex-wrap gap-3 lg:justify-end">
                        {providers.map(p => (
                            <div
                                key={p.id}
                                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-charcoal rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-w-[120px]"
                            >
                                {p.logoUrl ? (
                                    <div className="w-14 h-14 flex items-center justify-center">
                                        <Image
                                            src={p.logoUrl}
                                            alt={`${p.name} logo`}
                                            width={56}
                                            height={56}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-brand-green/10 flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-brand-green" />
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-sm font-bold text-body leading-tight">{p.name}</p>
                                    {p.description && (
                                        <p className="text-[10px] text-caption mt-0.5 line-clamp-2 max-w-[100px]">
                                            {p.description}
                                        </p>
                                    )}
                                    {p.websiteUrl && (
                                        <a
                                            href={p.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-0.5 text-[10px] text-brand-green hover:underline mt-1"
                                        >
                                            Visit site <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="relative z-10 mt-8 pt-6 border-t border-neutral-100 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                        Not sure if your plan is covered? Contact us before your appointment and we'll help
                        you verify.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green text-white text-sm font-semibold hover:bg-brand-green/90 transition-colors shadow-sm shadow-brand-green/20 whitespace-nowrap"
                    >
                        Verify My Cover
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
