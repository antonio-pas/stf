import {
  getCookie,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server"
import { count, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { db } from "@/db"
import {
  issuePollOptionsTable,
  issuePollVotesTable,
  meetingPollOptionsTable,
  meetingPollVotesTable,
} from "@/db/schema"
import type { PollState, PollType } from "./polls.function"

const polls = {
  issue: {
    options: issuePollOptionsTable,
    votes: issuePollVotesTable,
    cookie: "stf_issue_vote",
  },
  meeting: {
    options: meetingPollOptionsTable,
    votes: meetingPollVotesTable,
    cookie: "stf_meeting_vote",
  },
}

async function getExistingVote(pollType: PollType) {
  const { votes, cookie } = polls[pollType]
  const voteId = getCookie(cookie)
  if (!voteId) return null

  const [vote] = await db
    .select({ optionId: votes.optionId })
    .from(votes)
    .where(eq(votes.id, voteId))
    .limit(1)
  return vote ?? null
}

async function loadPoll(
  pollType: PollType,
  savedOptionId?: string
): Promise<PollState> {
  const { options, votes } = polls[pollType]
  const selectedOptionId =
    savedOptionId ?? (await getExistingVote(pollType))?.optionId ?? null
  const choices = await db
    .select({ id: options.id, text: options.text })
    .from(options)
    .orderBy(options.id)

  // Keep results out of the response until this visitor has voted in this poll.
  const totals =
    selectedOptionId !== null
      ? await db
          .select({ optionId: votes.optionId, votes: count() })
          .from(votes)
          .groupBy(votes.optionId)
      : []
  const counts = new Map(totals.map((total) => [total.optionId, total.votes]))

  return {
    options: choices.map((option) => ({
      ...option,
      votes: selectedOptionId !== null ? (counts.get(option.id) ?? 0) : null,
    })),
    selectedOptionId,
  }
}

export async function loadPolls() {
  setResponseHeader("Cache-Control", "private, no-store")
  const [issue, meeting] = await Promise.all([
    loadPoll("issue"),
    loadPoll("meeting"),
  ])
  return { issue, meeting }
}

export async function savePollVote(pollType: PollType, optionId: string) {
  setResponseHeader("Cache-Control", "private, no-store")
  if (await getExistingVote(pollType)) {
    return {
      success: true as const,
      alreadyVoted: true,
      poll: await loadPoll(pollType),
    }
  }

  const { options, votes, cookie } = polls[pollType]
  const [option] = await db
    .select({ id: options.id })
    .from(options)
    .where(eq(options.id, optionId))
    .limit(1)
  if (!option) {
    return {
      success: false as const,
      message:
        "This option is no longer available. Please refresh and try again.",
    }
  }

  // Use the same random ID for the existing required userCookie column.
  const id = nanoid()
  const [vote] = await db
    .insert(votes)
    .values({ id, optionId, userCookie: id })
    .returning({ id: votes.id })
  setCookie(cookie, vote.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  })

  // The request cookie still contains the old value until the next request.
  return {
    success: true as const,
    alreadyVoted: false,
    poll: await loadPoll(pollType, optionId),
  }
}
