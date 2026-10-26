import { db } from "@/db"
import { postsTable } from "@/db/schema"
import { asc, desc, eq, ne } from "drizzle-orm"

export async function getPostPage(slug: string) {
  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.slug, slug))
    .limit(1)
  if (!post) return null

  const relatedPosts = await db
    .select({
      id: postsTable.id,
      slug: postsTable.slug,
      title: postsTable.title,
      description: postsTable.description,
      image: postsTable.image,
    })
    .from(postsTable)
    .where(ne(postsTable.id, post.id))
    .orderBy(desc(postsTable.date), asc(postsTable.slug))
    .limit(3)

  return { post, relatedPosts }
}
