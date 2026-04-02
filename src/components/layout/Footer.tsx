import { getServices } from "@/app/actions/services";
import { getSettings } from "@/app/actions/settings";
import {
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function Footer() {
    let settings: any = null;
    let services: any[] = [];

    try {
        settings = await getSettings();
    } catch {
        // Database unavailable — use defaults
    }

    try {
        services = await getServices();
    } catch {
        // Database unavailable — use defaults
    }

    const displayedServices = services;

    const currentYear = new Date().getFullYear();

    // Default values when settings fail to load — ensures Footer is never invisible
    const businessName = settings?.businessName || "Edwak Nutrition";
    const address = settings?.address || "Nairobi, Kenya";
    const phoneNumber = settings?.phoneNumber || "+254 700 000 000";
    const contactEmail = settings?.contactEmail || "info@edwaknutrition.co.ke";
    const facebookUrl = settings?.facebookUrl;
    const instagramUrl = settings?.instagramUrl;
    const twitterUrl = settings?.twitterUrl;
    const linkedinUrl = settings?.linkedinUrl;

    return (
        <footer className="bg-olive text-white pt-16 pb-8 mx-1.25 mb-1.25 rounded-b-xl rounded-t-none">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/logo.jpg"
                                alt={`${businessName} Logo`}
                                width={480}
                                height={200}
                                className="h-50 w-auto object-contain bg-white/10 rounded-xl p-2"
                            />
                        </Link>
                        <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                            Nutrition Care, That satisfies.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4 text-center md:text-left">
                        <h4 className="font-semibold text-lg text-white">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-orange transition-colors"
                                >
                                    Our Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="hover:text-orange transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-orange transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/booking"
                                    className="hover:text-orange transition-colors"
                                >
                                    Book Consultation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-4 text-center md:text-left">
                        <h4 className="font-semibold text-lg text-white">
                            Specialties
                        </h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            {displayedServices.length > 0 ? (
                                displayedServices
                                    .filter(
                                        (service) =>
                                            service.id !== "discovery-call",
                                    )
                                    .map((service) => (
                                        <li key={service.id}>
                                            <Link
                                                href={`/services/${service.slug}`}
                                                className="hover:text-orange transition-colors"
                                            >
                                                {service.title}
                                            </Link>
                                        </li>
                                    ))
                            ) : (
                                <li>General Nutrition</li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4 text-center md:text-left">
                        <h4 className="font-semibold text-lg text-white">
                            Contact Us
                        </h4>
                        <ul className="space-y-3 mb-14 text-sm text-white/80 flex flex-col items-center md:items-start">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-orange shrink-0" />
                                <span>{address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-orange shrink-0" />
                                <span>{phoneNumber}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-orange shrink-0" />
                                <span>{contactEmail}</span>
                            </li>
                        </ul>

                        {/* Social Icons — Orange, directly under Contact Us */}
                        <h4 className="font-semibold text-lg text-white mt-8 mb-4">
                            Social Links
                        </h4>
                        <div className="flex flex-col gap-3 items-center md:items-start pt-2">
                            {facebookUrl && (
                                <Link
                                    href={facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-orange hover:text-orange/80 transition-colors"
                                >
                                    <Facebook className="h-5 w-5" />{" "}
                                    <span>Facebook</span>
                                </Link>
                            )}
                            {instagramUrl && (
                                <Link
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-orange hover:text-orange/80 transition-colors"
                                >
                                    <Instagram className="h-5 w-5" />{" "}
                                    <span>Instagram</span>
                                </Link>
                            )}
                            {twitterUrl && (
                                <Link
                                    href={twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-orange hover:text-orange/80 transition-colors"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    <span>X (Twitter)</span>
                                </Link>
                            )}
                            {linkedinUrl && (
                                <Link
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-orange hover:text-orange/80 transition-colors"
                                >
                                    <Linkedin className="h-5 w-5" />{" "}
                                    <span>LinkedIn</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-2 text-xs text-white/60 md:flex-row md:justify-between md:gap-4">
                    <div className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
                        <Link
                            href="/privacy"
                            className="hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="hover:text-white transition-colors"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/cookies"
                            className="hover:text-white transition-colors"
                        >
                            Cookie Policy
                        </Link>
                    </div>
                    <p className="text-center">
                        © {currentYear} EDWAK NUTRITION CONSULTANCY. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
