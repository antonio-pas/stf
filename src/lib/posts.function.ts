import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export const getPost = createServerFn({ method: "GET" })
  .validator(z.string().min(1).max(200))
  .handler(async ({ data: slug }) => {
    const { getPostPage } = await import("./posts.server")
    return getPostPage(slug)
  })
