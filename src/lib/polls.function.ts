import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export type PollType = "issue" | "meeting"

export type PollState = {
  options: { id: string; text: string; votes: number | null }[]
  selectedOptionId: string | null
}

export const getPolls = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPolls } = await import("./polls.server")
  return loadPolls()
})

export const submitPollVote = createServerFn({ method: "POST" })
  .validator(
    z.object({
      pollType: z.enum(["issue", "meeting"]),
      optionId: z.string().min(1).max(255),
    })
  )
  .handler(async ({ data }) => {
    const { savePollVote } = await import("./polls.server")
    return savePollVote(data.pollType, data.optionId)
  })
