import { createSelectSchema } from "drizzle-orm/zod"
import { postsTable } from "./schema"
import type { z } from "zod"

export const postsSchema = createSelectSchema(postsTable)
export type Post = z.infer<typeof postsSchema>
