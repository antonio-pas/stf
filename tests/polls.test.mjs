import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { test } from "node:test"
import { runInNewContext } from "node:vm"
import ts from "typescript"

const require = createRequire(import.meta.url)

// Execute the server module with isolated request cookies and an in-memory DB.
// No tests connect to or mutate the configured database.
function loadModule(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const exports = {}
  runInNewContext(outputText, {
    exports,
    require: (name) => dependencies[name] ?? require(name),
    process: { env: { NODE_ENV: "production" } },
  })
  return exports
}

function setup() {
  const schema = {}
  const rows = new Map()
  for (const kind of ["issue", "meeting"]) {
    for (const type of ["Options", "Votes"]) {
      const table = Object.fromEntries(
        ["id", "text", "optionId", "userCookie"].map((key) => [key, key])
      )
      schema[`${kind}Poll${type}Table`] = table
      rows.set(
        table,
        type === "Options"
          ? [
              { id: `${kind}-a`, text: "First option" },
              { id: `${kind}-b`, text: "Second option" },
              { id: `${kind}-c`, text: "Third option" },
            ]
          : []
      )
    }
  }
  const cookies = new Map()
  const responseCookies = new Map()
  const headers = new Map()
  let sequence = 0
  let failInsert = false
  const db = {
    select(fields) {
      let table,
        condition,
        grouped = false,
        limit = Infinity
      const query = {
        from(value) {
          table = value
          return query
        },
        where(value) {
          condition = value
          return query
        },
        limit(value) {
          limit = value
          return query
        },
        orderBy() {
          return query
        },
        groupBy() {
          grouped = true
          return query
        },
        then(resolve, reject) {
          let result = rows
            .get(table)
            .filter(
              (row) => !condition || row[condition.column] === condition.value
            )
          if (grouped) {
            const counts = new Map()
            for (const row of result)
              counts.set(row.optionId, (counts.get(row.optionId) ?? 0) + 1)
            result = [...counts].map(([optionId, votes]) => ({
              optionId,
              votes,
            }))
          } else {
            result = result.map((row) =>
              Object.fromEntries(
                Object.entries(fields).map(([key, column]) => [
                  key,
                  row[column],
                ])
              )
            )
          }
          return Promise.resolve(result.slice(0, limit)).then(resolve, reject)
        },
      }
      return query
    },
    insert(table) {
      return {
        values(row) {
          return {
            async returning() {
              if (failInsert) throw new Error("Database unavailable")
              rows.get(table).push({ ...row })
              return [{ id: row.id }]
            },
          }
        },
      }
    },
  }
  const server = loadModule("../src/lib/polls.server.ts", {
    "@/db": { db },
    "@/db/schema": schema,
    "drizzle-orm": {
      eq: (column, value) => ({ column, value }),
      count: () => "count",
    },
    nanoid: { nanoid: () => `vote-${++sequence}` },
    "@tanstack/react-start/server": {
      getCookie: (key) => cookies.get(key),
      setCookie: (key, value, options) =>
        responseCookies.set(key, { value, options }),
      setResponseHeader: (key, value) => headers.set(key, value),
    },
  })
  return {
    ...server,
    rows,
    schema,
    cookies,
    responseCookies,
    headers,
    failInsert: (value) => {
      failInsert = value
    },
    nextRequest: () => {
      for (const [key, { value }] of responseCookies) cookies.set(key, value)
      responseCookies.clear()
    },
  }
}

for (const kind of ["issue", "meeting"]) {
  test(`${kind}: save, refresh, reject duplicate, and keep the other poll available`, async () => {
    const app = setup()
    const initial = await app.loadPolls()
    assert.equal(initial[kind].selectedOptionId, null)
    assert.ok(initial[kind].options.every((option) => option.votes === null))
    const saved = await app.savePollVote(kind, `${kind}-a`)
    assert.equal(saved.success, true)
    assert.equal(saved.alreadyVoted, false)
    assert.equal(saved.poll.selectedOptionId, `${kind}-a`)
    assert.deepEqual(
      Array.from(saved.poll.options, (option) => option.votes),
      [1, 0, 0]
    )
    const cookie = app.responseCookies.get(`stf_${kind}_vote`)
    const vote = app.rows.get(app.schema[`${kind}PollVotesTable`])[0]
    assert.equal(cookie.value, vote.id)
    assert.equal(vote.userCookie, vote.id)
    assert.equal(cookie.options.httpOnly, true)
    assert.equal(cookie.options.secure, true)
    assert.equal(cookie.options.sameSite, "lax")
    assert.equal(cookie.options.path, "/")
    assert.equal(cookie.options.maxAge, 31536000)
    app.nextRequest()
    const refreshed = await app.loadPolls()
    assert.equal(refreshed[kind].selectedOptionId, `${kind}-a`)
    const other = kind === "issue" ? "meeting" : "issue"
    assert.equal(refreshed[other].selectedOptionId, null)
    assert.ok(refreshed[other].options.every((option) => option.votes === null))
    const duplicate = await app.savePollVote(kind, `${kind}-b`)
    assert.equal(duplicate.alreadyVoted, true)
    assert.equal(duplicate.poll.selectedOptionId, `${kind}-a`)
    assert.equal(app.rows.get(app.schema[`${kind}PollVotesTable`]).length, 1)
    assert.equal((await app.savePollVote(other, `${other}-b`)).success, true)
    assert.equal(app.headers.get("Cache-Control"), "private, no-store")
  })
}

test("missing and cross-poll options do not create votes or cookies", async () => {
  const app = setup()
  for (const option of ["missing", "meeting-a"]) {
    assert.equal((await app.savePollVote("issue", option)).success, false)
  }
  assert.equal(app.rows.get(app.schema.issuePollVotesTable).length, 0)
  assert.equal(app.responseCookies.size, 0)
})

test("manual reset permits a new vote despite a stale cookie", async () => {
  const app = setup()
  await app.savePollVote("issue", "issue-a")
  app.nextRequest()
  app.rows.get(app.schema.issuePollVotesTable).length = 0
  const reset = await app.loadPolls()
  assert.equal(reset.issue.selectedOptionId, null)
  assert.ok(reset.issue.options.every((option) => option.votes === null))
  const saved = await app.savePollVote("issue", "issue-b")
  assert.equal(saved.alreadyVoted, false)
  assert.equal(saved.poll.selectedOptionId, "issue-b")
})

test("counts include other visitors, and polls with no options stay empty", async () => {
  const app = setup()
  await app.savePollVote("issue", "issue-a")
  await app.savePollVote("issue", "issue-a") // Another request without a cookie.
  const saved = await app.savePollVote("issue", "issue-b")
  assert.deepEqual(
    Array.from(saved.poll.options, (option) => option.votes),
    [2, 1, 0]
  )
  app.rows.get(app.schema.meetingPollOptionsTable).length = 0
  assert.equal((await app.loadPolls()).meeting.options.length, 0)
})

test("failed insertion leaves no cookie and allows retry", async () => {
  const app = setup()
  app.failInsert(true)
  await assert.rejects(
    app.savePollVote("meeting", "meeting-a"),
    /Database unavailable/
  )
  assert.equal(app.responseCookies.size, 0)
  assert.equal(app.rows.get(app.schema.meetingPollVotesTable).length, 0)
  app.failInsert(false)
  assert.equal((await app.savePollVote("meeting", "meeting-a")).success, true)
})

test("meeting vote foreign key targets meeting options", () => {
  const schema = loadModule("../src/db/schema.ts", {
    nanoid: { nanoid: () => "id" },
  })
  const { getTableConfig } = require("drizzle-orm/pg-core")
  const foreignKey = getTableConfig(
    schema.meetingPollVotesTable
  ).foreignKeys[0].reference()
  assert.equal(foreignKey.foreignTable, schema.meetingPollOptionsTable)
})

test("server function validates poll type and option ID before handling", () => {
  const server = loadModule("../src/lib/polls.function.ts", {
    "@tanstack/react-start": {
      createServerFn: () => ({
        handler: (handler) => handler,
        validator: (validator) => ({ handler: () => validator }),
      }),
    },
  })
  const validator = server.submitPollVote
  assert.equal(
    validator.safeParse({ pollType: "issue", optionId: "issue-a" }).success,
    true
  )
  for (const data of [
    { pollType: "unknown", optionId: "issue-a" },
    { pollType: "issue", optionId: "" },
    { pollType: "meeting", optionId: 123 },
    { pollType: "meeting", optionId: "a".repeat(256) },
  ]) {
    assert.equal(validator.safeParse(data).success, false)
  }
})
