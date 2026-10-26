import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import Markdown from "react-markdown"
import { getPost } from "@/lib/posts.function"

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params }) => {
    const page = await getPost({ data: params.slug })
    if (!page) throw notFound()
    return page
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} | Student Task Force` },
          { name: "description", content: loaderData.post.description },
        ]
      : [],
  }),
  pendingComponent: () => <p role="status">Loading article…</p>,
  component: PostPage,
})

function PostPage() {
  const { post, relatedPosts } = Route.useLoaderData()
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${post.date}T00:00:00Z`))

  return (
    <main className="pb-20">
      <header className="mb-12">
        <h1 className="mb-4 font-heading text-3xl font-bold lg:text-4xl">
          {post.title}
        </h1>
        <h2 className="mb-5 max-w-3xl font-heading text-2xl font-medium lg:text-3xl">
          {post.description}
        </h2>
        <p className="mb-1 font-heading">
          By <span className="font-semibold">{post.author}</span>
        </p>
        <p className="font-heading">
          <time dateTime={post.date}>{formattedDate}</time>
        </p>
      </header>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,65ch)_minmax(0,1fr)]">
        <article className="prose max-w-none min-w-0 prose-stone prose-headings:font-heading prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-a:text-red-800 prose-a:underline-offset-2">
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="aspect-video w-full rounded-none object-cover"
            />
          )}
          <Markdown>{post.markdown}</Markdown>
        </article>
        {relatedPosts.length > 0 && (
          <aside
            aria-labelledby="related-posts-heading"
            className="min-w-0 border-t-2 border-black pt-5 lg:border-t-0 lg:pt-0"
          >
            <h2
              id="related-posts-heading"
              className="mb-5 font-heading text-xl font-medium"
            >
              Viewers also read
            </h2>
            <div className="flex flex-col gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to="/posts/$slug"
                  params={{ slug: related.slug }}
                  className="group block border-2 border-black p-4 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  {related.image && (
                    <img
                      src={related.image}
                      alt=""
                      loading="lazy"
                      className="mb-4 aspect-square w-full rounded-none object-cover"
                    />
                  )}
                  <h3 className="mb-2 font-heading text-lg font-medium underline-offset-4 group-hover:underline">
                    {related.title}
                  </h3>
                  <p className="text-sm">{related.description}</p>
                  <span className="mt-4 inline-block text-sm text-red-800 underline underline-offset-2">
                    Read article <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </main>
  )
}
