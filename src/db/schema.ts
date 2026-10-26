import { date, pgTable, text } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

export const postsTable = pgTable("posts", {
  id: text()
    .$defaultFn(() => nanoid())
    .primaryKey(),
  slug: text().notNull(),
  title: text().notNull(),
  author: text().notNull(),
  description: text().notNull(),
  date: date().notNull(),
  markdown: text().notNull(),
  image: text().notNull(),
})

export const issuePollOptionsTable = pgTable("issue_poll_options", {
  id: text()
    .$defaultFn(() => nanoid())
    .primaryKey(),
  text: text().notNull(),
})

export const meetingPollOptionsTable = pgTable("meeting_poll_options", {
  id: text()
    .$defaultFn(() => nanoid())
    .primaryKey(),
  text: text().notNull(),
})

export const issuePollVotesTable = pgTable("issue_poll_votes", {
  id: text()
    .$defaultFn(() => nanoid())
    .primaryKey(),
  optionId: text()
    .notNull()
    .references(() => issuePollOptionsTable.id),
  userCookie: text().notNull(),
})

export const meetingPollVotesTable = pgTable("meeting_poll_votes", {
  id: text()
    .$defaultFn(() => nanoid())
    .primaryKey(),
  optionId: text()
    .notNull()
    .references(() => meetingPollOptionsTable.id),
  userCookie: text().notNull(),
})
