import { createFileRoute } from "@tanstack/react-router"
import clubMeetingPicture from "@/assets/club-meeting.jpg"
import tentEventPicture from "@/assets/tent-event.png"

export const Route = createFileRoute("/sbrr-progress")({
  head: () => ({
    meta: [
      { title: "SBRR Progress | Student Task Force" },
      {
        name: "description",
        content:
          "Follow our 2026 progress on the Student Bill of Rights and Responsibilities, from drafting ideas to working toward district ratification.",
      },
    ],
  }),
  component: SBRRProgress,
})

type Milestone = {
  date: string
  title: string
  description: string
  current: boolean
  image?: { src: string; alt: string; caption: string }
}

// Add a photo URL to an image's src below, or a path from public/ (e.g. /images/tent-event.jpg).
const milestones: Milestone[] = [
  {
    date: "January–March",
    title: "Putting our ideas on paper",
    description:
      "We started drafting ideas for the Student Bill of Rights and Responsibilities, putting students’ rights and responsibilities at the center of the conversation.",
    current: false,
  },
  {
    date: "May",
    title: "Bringing the conversation to campus",
    description:
      "We hosted school events focused on the Student Bill of Rights and Responsibilities, bringing the conversation to our school community.",
    current: false,
    image: {
      src: tentEventPicture,
      alt: "Students at one of our school tent events",
      caption: "School tent events · May 2026",
    },
  },
  {
    date: "June–August",
    title: "Working together across schools",
    description:
      "We met with students from other schools across LAUSD to discuss the Student Bill of Rights and Responsibilities and share ideas across our campuses.",
    current: false,
  },
  {
    date: "October–November",
    title: "Taking it to the district",
    description:
      "We are contacting district board members to work toward ratifying the Student Bill of Rights and Responsibilities at the district level.",
    current: true,
    image: {
      src: clubMeetingPicture,
      alt: "Students at a current Student Task Force club meeting",
      caption: "Club meetings · October–November 2026",
    },
  },
]

function SBRRProgress() {
  return (
    <main className="pb-20">
      <header className="mb-12">
        <h1 className="mb-4 font-heading text-3xl font-bold lg:text-4xl">
          SBRR Progress
        </h1>
        <h2 className="mb-5 max-w-3xl font-heading text-2xl font-medium lg:text-3xl">
          Student Bill of Rights and Responsibilities
        </h2>
        <p className="max-w-prose">
          From our first ideas to conversations with district leaders, follow
          our work to bring the Student Bill of Rights and Responsibilities to
          schools across LAUSD.
        </p>
      </header>

      <section aria-labelledby="timeline-heading">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-black pb-4">
          <h2
            id="timeline-heading"
            className="font-heading text-xl font-semibold"
          >
            Our progress in 2026
          </h2>
        </div>

        <ol className="ml-4 border-l-2 border-black md:ml-44">
          {milestones.map((milestone, index) => (
            <li
              key={milestone.date}
              aria-current={milestone.current ? "step" : undefined}
              className="relative pb-10 pl-8 last:pb-0 sm:pl-10"
            >
              <span
                aria-hidden="true"
                className={`absolute top-6 -left-[17px] flex size-8 items-center justify-center border-2 border-black text-sm font-bold text-white ${milestone.current ? "bg-primary" : "bg-black"}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div
                className={
                  milestone.image
                    ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]"
                    : undefined
                }
              >
                <article
                  aria-labelledby={`milestone-${index}`}
                  className={`rounded-md border-2 bg-white p-5 sm:p-6 ${milestone.current ? "border-primary" : "border-black"}`}
                >
                  <p className="mb-4 text-sm font-semibold md:absolute md:top-7 md:-left-44 md:mb-0 md:w-36">
                    <span className="block">{milestone.date}</span>
                    <span className="font-normal text-stone-600">2026</span>
                  </p>
                  <span
                    className={`mb-4 inline-block border px-2 py-1 text-xs font-semibold tracking-wide uppercase ${milestone.current ? "border-primary bg-primary text-white" : "border-black text-black"}`}
                  >
                    {milestone.current ? "In progress" : "Completed"}
                  </span>
                  <h3
                    id={`milestone-${index}`}
                    className="mb-3 font-heading text-xl font-medium"
                  >
                    {milestone.title}
                  </h3>
                  <p className="max-w-prose">{milestone.description}</p>
                </article>
                {milestone.image && (
                  <figure className="w-full max-w-xs lg:max-w-none">
                    {milestone.image.src ? (
                      <img
                        src={milestone.image.src}
                        alt={milestone.image.alt}
                        width={416}
                        height={416}
                        loading="lazy"
                        className="aspect-square w-full rounded-none object-cover"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`Photo placeholder: ${milestone.image.alt}`}
                        className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-stone-100 p-6 text-center text-sm text-stone-600"
                      >
                        <svg
                          aria-hidden="true"
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" />
                          <circle cx="8" cy="8" r="1.5" />
                          <path d="m3 17 5-5 4 4 4-6 5 7" />
                        </svg>
                        <span>Photo coming soon</span>
                      </div>
                    )}
                    <figcaption className="mt-2 text-sm text-stone-600">
                      {milestone.image.caption}
                    </figcaption>
                  </figure>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
