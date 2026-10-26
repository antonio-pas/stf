import { config } from "dotenv"
import pg from "pg"
import { nanoid } from "nanoid"

const posts = [
  {
    slug: "topic",
    title: "What Is This Year’s Topic?",
    description: "The United Nations Convention on the Rights of the Child.",
    author: "Student Task Force",
    date: "2026-10-26",
    image: "",
    markdown: `This year, Student Task Force at Van Nuys is focusing on the **United Nations Convention on the Rights of the Child**, often called the **UNCRC**. We’re using it to start conversations about what respecting students’ rights looks like in our school community.

## What is the UNCRC?

The Convention is an international human rights treaty about children. It recognizes children as people with rights of their own, including opportunities to learn, develop, be protected from harm, and take part in decisions that affect them.

Its four guiding principles are:

- **Equal treatment:** children’s rights apply without discrimination.
- **Children’s best interests:** decisions concerning children should take their best interests into account.
- **Life and development:** children should have the opportunity to survive and develop.
- **Being heard:** children should be able to express their views on matters affecting them, and those views should be taken seriously.

## Why talk about this at school?

School is where we spend much of our time learning, building relationships, and preparing for the future. It’s also where we can ask practical questions: Can every student participate? Whose voices are missing from a conversation? What would make our campus more welcoming?

These questions connect our annual topic to everyday student experiences. They also give us a starting point for discussing the Student Bill of Rights and Responsibilities.

## How to get involved

Bring an idea, a question, or an experience to a club meeting. You can also vote in our homepage polls to help choose the issues we discuss next. We meet **Fridays in Room 325 at lunch**.

Follow our [SBRR progress](/sbrr-progress) to see the work so far. Our school and district advocacy is about putting these principles into practice; it is separate from a country formally ratifying an international treaty.

## Read more

- [UNICEF: Questions and answers about the Convention](https://www.unicef.org/stories/child-rights-convention-faq)
- [What Are Human Rights?](/posts/human-rights)
`,
  },
  {
    slug: "human-rights",
    title: "What Are Human Rights?",
    description:
      "A guide to dignity, equality, and why human rights matter at school.",
    author: "Student Task Force",
    date: "2026-10-26",
    image: "",
    markdown: `Human rights are rights that belong to every person. They begin with a simple idea: **everyone deserves dignity and equal respect**.

You don’t have to earn them through good grades, popularity, citizenship, or someone else’s approval. That makes human rights a useful starting point for thinking about how we treat one another, including here at Van Nuys.

## A shared foundation

In 1948, the United Nations General Assembly adopted the **Universal Declaration of Human Rights**. It describes a shared standard for protecting people’s dignity and freedoms.

The Declaration includes rights related to education, freedom of expression, equal protection, privacy, and participation in community life. It also recognizes the importance of basic needs, including food, housing, and medical care.

These rights are connected. Being able to attend school matters, and so does having the support and opportunity to learn once you get there.

## What does that mean for students?

Human rights give us a way to ask questions about our own community:

- Can students with disabilities access the spaces and activities they need?
- Do students feel comfortable sharing ideas and being heard?
- Are people treated with respect regardless of their identity or background?
- What barriers make it harder for students to take part in school life?

These are starting points for discussion, rather than claims that every disagreement is a human rights violation. Listening carefully and understanding what happened helps us decide what needs to change.

## From an idea to action

At Student Task Force, we want to turn these conversations into thoughtful action. That can start with noticing a problem, asking other students about their experiences, and identifying a practical improvement to bring to school leaders.

You can help by contributing to a meeting, voting in our homepage polls, or following our [Student Bill of Rights and Responsibilities progress](/sbrr-progress).

This year, we’re also exploring how these ideas apply specifically to young people through the [United Nations Convention on the Rights of the Child](/posts/topic).

## Read more

- [United Nations: Universal Declaration of Human Rights](https://www.un.org/en/about-us/universal-declaration-of-human-rights/)
`,
  },
]

config({ quiet: true })
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
})

try {
  await client.connect()
  await client.query("BEGIN")
  // The existing schema has no unique slug constraint; serialize seed runs.
  await client.query("LOCK TABLE posts IN SHARE ROW EXCLUSIVE MODE")
  for (const post of posts) {
    const existing = await client.query(
      "SELECT id FROM posts WHERE slug = $1",
      [post.slug]
    )
    if (existing.rowCount > 1)
      throw new Error(
        `Multiple posts already use slug ${post.slug}; no changes saved.`
      )
    const values = [
      post.slug,
      post.title,
      post.author,
      post.description,
      post.date,
      post.markdown,
      post.image,
    ]
    if (existing.rowCount === 1) {
      await client.query(
        "UPDATE posts SET slug = $1, title = $2, author = $3, description = $4, date = $5, markdown = $6, image = $7 WHERE id = $8",
        [...values, existing.rows[0].id]
      )
    } else {
      await client.query(
        "INSERT INTO posts (slug, title, author, description, date, markdown, image, id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [...values, nanoid()]
      )
    }
  }
  await client.query("COMMIT")
  console.log(
    JSON.stringify(
      { saved: posts.map(({ slug, title }) => ({ slug, title })) },
      null,
      2
    )
  )
} catch (error) {
  await client.query("ROLLBACK").catch(() => {})
  console.error(JSON.stringify({ code: error.code, message: error.message }))
  process.exitCode = 1
} finally {
  await client.end()
}
