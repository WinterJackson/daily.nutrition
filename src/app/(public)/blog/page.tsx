import { getPosts } from "@/app/actions/blog"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Blog | Daily Nutrition",
  description: "Latest insights, nutrition tips, and success stories."
}

export default async function BlogIndexPage() {
  const { posts } = await getPosts(true) // Published only

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-24 pb-24 relative overflow-hidden">
      <AnimatedBackground variant="nutrition" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <header className="mb-16 text-center max-w-3xl mx-auto">
           <div className="inline-flex items-center justify-center p-1 rounded-full bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 mb-6 backdrop-blur-sm">
              <span className="px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-semibold uppercase tracking-wider">
                 Our Blog
              </span>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold font-serif text-olive dark:text-off-white mb-6">
             Nutrition Insights
           </h1>
           <p className="text-lg text-neutral-600 dark:text-neutral-300">
             Evidence-based articles, recipes, and wellness tips to support your health journey.
           </p>
        </header>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="h-full flex flex-col border-neutral-200 dark:border-white/10 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-white/5 backdrop-blur-sm group overflow-hidden hover:-translate-y-1">
                 <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    {/* Featured Image */}
                    {post.image ? (
                        <div className="relative w-full aspect-video overflow-hidden">
                            <Image 
                                src={post.image} 
                                alt={post.title} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 dark:bg-charcoal/90 backdrop-blur text-xs font-semibold text-olive dark:text-brand-green rounded-full shadow-sm">
                                    {post.category || "General"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-neutral-100 dark:bg-white/5 flex items-center justify-center relative">
                             <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 dark:bg-charcoal/90 backdrop-blur text-xs font-semibold text-olive dark:text-brand-green rounded-full shadow-sm">
                                    {post.category || "General"}
                                </span>
                            </div>
                            <span className="text-neutral-400">No Image</span>
                        </div>
                    )}

                    <CardHeader>
                       <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                          <Calendar className="w-3 h-3" />
                          {post.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                       </div>
                       <CardTitle className="text-xl font-serif text-olive dark:text-off-white group-hover:text-brand-green transition-colors leading-tight line-clamp-2">
                          {post.title}
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0">
                       <div className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3">
                          {/* Basic strip markdown */}
                          <p>{post.content.replace(/[#*`_\[\]]/g, '').substring(0, 120)}...</p>
                       </div>
                    </CardContent>
                    <CardFooter className="text-brand-green font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all mt-auto border-t border-neutral-100 dark:border-white/5 pt-4 mx-6 px-0">
                       Read Article <ArrowRight className="w-4 h-4" />
                    </CardFooter>
                 </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-neutral-300 dark:border-white/10">
             <p className="text-neutral-500 dark:text-neutral-400">No articles published yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
