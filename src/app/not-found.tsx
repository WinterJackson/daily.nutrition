import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-charcoal dark:to-black px-4">
            <div className="text-center max-w-md space-y-6">
                <div className="relative">
                    <span className="text-[120px] font-bold font-serif text-brand-green/10 dark:text-brand-green/5 leading-none select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange/10 dark:bg-orange/5">
                            <svg className="w-10 h-10 text-orange" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">
                    Page not found
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl bg-brand-green text-white font-semibold hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/services"
                        className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 font-semibold hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Browse Services
                    </Link>
                </div>
            </div>
        </div>
    )
}
