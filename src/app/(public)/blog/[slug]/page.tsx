import { getPostBySlug } from "@/app/actions/blog"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) return { title: "Post Not Found" }
  
  return {
    title: `${post.title} | Daily Nutrition`,
    description: post.content.substring(0, 160)
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-24 pb-24 relative">
      <AnimatedBackground variant="dots" />
      
      <article className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
           <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-neutral-500 hover:text-olive dark:hover:text-brand-green">
              <Link href="/blog" className="flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
           </Button>
        </div>

        <header className="mb-12">
           <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
              <span className="flex items-center gap-1.5 bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full">
                 <Calendar className="w-4 h-4" />
                 {post.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-medium">
                 Article
              </span>
           </div>
           
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-olive dark:text-off-white mb-8 leading-tight">
              {post.title}
           </h1>
        </header>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-white/10 shadow-sm">
           <div className="prose prose-lg prose-olive dark:prose-invert max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
           </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-olive dark:bg-charcoal border border-olive/10 dark:border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-green/10 pattern-grid-lg opacity-20" />
           <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                 Ready to take control of your nutrition?
              </h3>
              <p className="text-white/80 mb-8">
                 Book a free discovery call today and let's discuss how we can help you achieve your health goals.
              </p>
              <Button asChild size="lg" className="bg-white text-olive hover:bg-neutral-100 rounded-full font-semibold px-8">
                 <Link href="/booking">Book Free Consultation</Link>
              </Button>
           </div>
        </div>
      </article>
    </div>
  )
}
