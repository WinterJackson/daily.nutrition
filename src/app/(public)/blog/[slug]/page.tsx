import { getPostBySlug, getRelatedPosts } from "@/app/actions/blog"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react"
import type { Metadata, ResolvingMetadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown, { Components } from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

/** Calculate read time from markdown content */
function calculateReadTime(content: string): number {
  const plainText = content.replace(/[#*_\[\]()>`~\-|]/g, "").trim()
  const wordCount = plainText.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Custom react-markdown component overrides
 * Matches Edwak Nutrition brand design system tokens
 */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-bold font-serif text-olive dark:text-off-white mt-10 mb-4 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl md:text-3xl font-bold font-serif text-olive dark:text-off-white mt-8 mb-3 leading-snug border-b border-brand-green/20 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl md:text-2xl font-semibold font-serif text-olive dark:text-off-white mt-6 mb-2 leading-snug">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
      {children}
    </p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-orange pl-6 py-2 my-6 rounded-r-lg" style={{ backgroundColor: "rgba(232, 117, 26, 0.05)" }}>
      <div className="italic" style={{ color: "var(--accent-secondary)" }}>
        {children}
      </div>
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-1.5" style={{ color: "var(--text-secondary)" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1.5" style={{ color: "var(--text-secondary)" }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-base md:text-lg leading-relaxed">{children}</li>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-brand-green hover:text-brand-green/80 underline underline-offset-2 transition-colors font-medium" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-olive dark:text-off-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic" style={{ color: "var(--accent-secondary)" }}>{children}</em>
  ),
  img: ({ src, alt }) => {
    // Image alignment hack: parse #left or #right from alt text
    let alignment = ""
    let cleanAlt = alt || ""
    if (cleanAlt.includes("#left")) {
      alignment = "float-left mr-6 mb-4 md:max-w-[45%]"
      cleanAlt = cleanAlt.replace("#left", "").trim()
    } else if (cleanAlt.includes("#right")) {
      alignment = "float-right ml-6 mb-4 md:max-w-[45%]"
      cleanAlt = cleanAlt.replace("#right", "").trim()
    }

    return (
      <span className={`block ${alignment} my-6 ${!alignment ? "w-full" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={cleanAlt}
          className="rounded-2xl shadow-lg w-full h-auto"
          loading="lazy"
        />
        {cleanAlt && (
          <span className="block text-center text-xs mt-2 italic" style={{ color: "var(--text-muted)" }}>
            {cleanAlt}
          </span>
        )}
      </span>
    )
  },
  code: ({ className, children }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md text-sm font-mono bg-brand-green/10 text-brand-green dark:bg-brand-green/20">
          {children}
        </code>
      )
    }
    return (
      <code className={`block ${className || ""}`}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="rounded-xl p-5 my-6 overflow-x-auto text-sm font-mono leading-relaxed border" style={{ backgroundColor: "var(--surface-secondary, #1a2118)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ backgroundColor: "var(--surface-secondary)" }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-olive dark:text-off-white border-b" style={{ borderColor: "var(--border-default)" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-8 border-none h-px" style={{ background: "linear-gradient(to right, transparent, var(--accent-primary), transparent)" }} />
  ),
}

export async function generateMetadata(
  { params }: BlogPostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) return { title: "Post Not Found" }
  
  const title = post.metaTitle || `${post.title} | Edwak Nutrition`
  const description = post.metaDescription || post.content.replace(/[#*`_\[\]]/g, '').substring(0, 160).trim() + "..."
  
  const previousImages = (await parent).openGraph?.images || []
  
  const ogImages = post.image 
    ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] 
    : previousImages

  return {
    title: title,
    description: description,
    openGraph: {
      title: post.metaTitle || post.title,
      description: description,
      url: `https://daily.nutrition/blog/${post.slug}`,
      siteName: 'Edwak Nutrition',
      images: ogImages,
      locale: 'en_US',
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: ['Edwak Nutrition Team'],
      section: post.category?.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: description,
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.published) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.category?.name || "", post.id)
  const readTime = calculateReadTime(post.content)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.image ? [post.image] : [],
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{
        '@type': 'Organization',
        name: 'Edwak Nutrition Team',
        url: 'https://daily.nutrition'
    }],
    publisher: {
        '@type': 'Organization',
        name: 'Edwak Nutrition',
        logo: {
            '@type': 'ImageObject',
            url: 'https://daily.nutrition/logo.png'
        }
    },
    description: post.content.replace(/[#*`_\[\]]/g, '').substring(0, 160).trim() + "..."
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-24 pb-24 relative">
      <AnimatedBackground variant="subtle" />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="container max-w-7xl mx-auto mt-15 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
           <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-neutral-500 hover:text-olive dark:hover:text-brand-green">
              <Link href="/blog" className="flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
           </Button>
        </div>

        <header className="mb-12 max-w-5xl mx-auto text-center">
           <div className="flex items-center justify-center gap-4 text-sm text-neutral-500 mb-6 font-medium flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full border border-neutral-100 dark:border-white/5">
                 <Calendar className="w-3.5 h-3.5" />
                 {post.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full border border-neutral-100 dark:border-white/5">
                 <Clock className="w-3.5 h-3.5" />
                 {readTime} min read
              </span>
              <Link href={`/blog?category=${post.category?.name || "All"}`}>
                <span className="flex items-center gap-1.5 bg-brand-green/10 text-brand-green px-3 py-1 rounded-full hover:bg-brand-green/20 transition-colors cursor-pointer">
                   <Tag className="w-3 h-3" />
                   {post.category?.name || "Article"}
                </span>
              </Link>
           </div>
           
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-olive dark:text-off-white mb-8 leading-tight">
              {post.title}
           </h1>

           {post.image && (
             <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-12">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                    src={post.image} 
                    alt={post.title}
                    className="object-cover w-full h-full"
                 />
             </div>
           )}
        </header>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-white/10 shadow-sm">
           <div className="max-w-3xl mx-auto">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
              {/* Clear floats from image alignment */}
              <div className="clear-both" />
           </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
            <div className="mt-16">
                <h3 className="text-2xl font-serif font-bold text-olive dark:text-off-white mb-6 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-brand-green" />
                    Read Next in {post.category?.name || "our blog"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map((related) => (
                        <Card key={related.id} className="h-full flex flex-col border-neutral-200 dark:border-white/10 hover:shadow-lg transition-all bg-white/60 dark:bg-white/5 backdrop-blur-sm group">
                            <Link href={`/blog/${related.slug}`} className="flex flex-col h-full">
                                {related.image && (
                                    <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
                                        <Image 
                                            src={related.image} 
                                            alt={related.title} 
                                            fill 
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-lg font-serif text-olive dark:text-off-white group-hover:text-brand-green transition-colors line-clamp-2">
                                        {related.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="p-4 pt-0 mt-auto text-sm text-brand-green font-medium">
                                    Read Article <ArrowRight className="w-3 h-3 ml-1" />
                                </CardFooter>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-olive dark:bg-charcoal border border-olive/10 dark:border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-brand-green/10 pattern-grid-lg opacity-20" />
           <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                 Ready to take control of your nutrition?
              </h3>
              <p className="text-white/80 mb-8">
                 Book a free discovery call today and let&apos;s discuss how we can help you achieve your health goals.
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
