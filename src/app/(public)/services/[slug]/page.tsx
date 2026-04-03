import { getServiceBySlug } from "@/app/actions/services";
import { ServiceBookingCard } from "@/components/services/ServiceBookingCard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ArrowLeft, CheckCircle2, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ServicePage({ params }: Props) {
    const { slug } = await params;
    const service = await getServiceBySlug(slug);

    if (!service) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-off-white dark:bg-charcoal pt-24 pb-16 relative overflow-hidden">
            {/* Animated Background */}
            <AnimatedBackground variant="nutrition" />

            {/* Breadcrumb / Back */}
            <div className="container max-w-7xl mx-auto mt-15 px-4 sm:px-6 lg:px-8 mb-8 relative z-10">
                <Link
                    href="/services"
                    className="inline-flex items-center text-sm md:text-base font-medium text-neutral-500 hover:text-brand-green transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Services
                </Link>
            </div>

            {/* Service Image */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10">
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                    {service.image ? (
                        <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-white/5 text-neutral-300 dark:text-neutral-600">
                            <ImageIcon className="w-16 h-16 mb-2" />
                            <span className="text-xs md:text-sm font-medium">No image available</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div
                            className={`inline-flex p-3 rounded-xl ${service.bgColor} ${service.color} mb-6`}
                        >
                            <ServiceIcon name={service.icon} className="w-8 h-8" />
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif text-olive dark:text-off-white mb-6">
                            {service.title}
                        </h1>

                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
                            {service.fullDescription}
                        </p>

                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-neutral-100 dark:border-white/10 mb-12">
                            <h3 className="text-xl md:text-2xl font-semibold text-olive dark:text-off-white mb-6">
                                What We Cover
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.features.map((feature, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-brand-green mt-0.5 shrink-0" />
                                        <span className="text-base md:text-lg text-neutral-700 dark:text-neutral-300">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-soft-green/10 to-brand-green/5 dark:from-white/5 dark:to-white/2 rounded-2xl p-8 mb-12">
                            <h3 className="text-xl md:text-2xl font-semibold text-olive dark:text-off-white mb-4">
                                Who This Is For
                            </h3>
                            <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {service.targetAudience}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar / Enhanced Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <ServiceBookingCard
                                serviceId={service.id}
                                serviceTitle={service.title}
                                serviceColor={service.color}
                                serviceBgColor={service.bgColor}
                                ServiceIcon={service.icon}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
