import { createFileRoute, Link } from "@tanstack/react-router"
import childrenImage from "@/assets/children.jpg"
import humanRightsImage from "@/assets/human-rights.webp"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import confetti from "@hiseb/confetti"
import { Confetti } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getPolls, submitPollVote } from "@/lib/polls.function"
import type { PollState, PollType } from "@/lib/polls.function"
import type { FormEvent } from "react"

export const Route = createFileRoute("/")({
  loader: () => getPolls(),
  component: App,
})

function Poll({
  pollType,
  title,
  initialPoll,
}: {
  pollType: PollType
  title: string
  initialPoll: PollState
}) {
  const [poll, setPoll] = useState(initialPoll)
  const [selectedOptionId, setSelectedOptionId] = useState(
    initialPoll.selectedOptionId
  )
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitted = poll.selectedOptionId !== null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedOptionId || submitted || pending) return
    setPending(true)
    setError(null)

    try {
      const result = await submitPollVote({
        data: { pollType, optionId: selectedOptionId },
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      setPoll(result.poll)
      setSelectedOptionId(result.poll.selectedOptionId)
      if (!result.alreadyVoted) {
        confetti({ count: 500, size: 2, velocity: 200 })
      }
    } catch {
      setError("We couldn't submit your vote. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <section
      className="mb-8 flex flex-col gap-4 rounded-md border-2 border-black px-4 py-3"
      aria-labelledby={`${pollType}-title`}
    >
      <h4 id={`${pollType}-title`} className="font-heading text-lg font-medium">
        {title}
      </h4>
      {poll.options.length === 0 ? (
        <p className="text-sm">
          No options are available yet. Check back soon!
        </p>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={submit}
          aria-busy={pending}
        >
          <fieldset
            disabled={submitted || pending}
            className="flex flex-col gap-2"
          >
            <legend className="sr-only">Choose one option</legend>
            {poll.options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-black p-2 hover:bg-black/10 has-disabled:cursor-not-allowed has-disabled:opacity-60"
              >
                <input
                  type="radio"
                  name={`${pollType}-option`}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  className="size-4 shrink-0 accent-black"
                />
                <span className="flex-1">{option.text}</span>
                {submitted && option.votes !== null && (
                  <span className="text-sm tabular-nums">
                    {option.votes} {option.votes === 1 ? "vote" : "votes"}
                  </span>
                )}
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-red-800">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={submitted || pending || !selectedOptionId}
            size="lg"
          >
            {submitted ? (
              <>
                Submitted <HugeiconsIcon icon={Confetti} />
              </>
            ) : pending ? (
              "Submitting…"
            ) : (
              "Submit"
            )}
          </Button>
          {submitted && (
            <p role="status" className="text-sm">
              Your vote has been recorded. Thank you!
            </p>
          )}
        </form>
      )}
    </section>
  )
}

function App() {
  const polls = Route.useLoaderData()
  return (
    <div className="">
      <h1 className="mb-4 font-heading text-5xl font-bold lg:text-6xl">
        Student Task Force
      </h1>
      <h2 className="mb-12 font-heading text-2xl font-medium lg:text-4xl">
        Protecting human rights at Van Nuys
      </h2>

      <p className="mb-8 text-lg leading-8">
        We're a branch of the <b>Student Task Force</b>, a youth leadership
        program within <b>Human Rights Watch (HRW)</b>. We work to{" "}
        <b>make sure human rights are protected at Van Nuys</b>. Our meetings
        are <b>Fridays in Room 325 at lunch</b>.
      </p>
      <h3 className="mb-4 font-heading text-xl font-semibold lg:text-2xl">
        Voice your own opinion through our weekly polls:
      </h3>

      <div className="grid gap-4 lg:grid-cols-2">
        <Poll
          pollType="issue"
          title="What's the biggest human rights issue facing Van Nuys this week?"
          initialPoll={polls.issue}
        />
        <Poll
          pollType="meeting"
          title="What should the topic of our next meeting be?"
          initialPoll={polls.meeting}
        />
      </div>

      <h3 className="mb-4 font-heading text-xl font-semibold lg:text-2xl">
        Check out posts written by the STF team:
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <img
            className="aspect-video w-full object-cover"
            src={childrenImage}
            alt="Children gathered around a garden bed"
          />
          <div className="flex flex-col gap-2 px-2 py-4">
            <h3 className="font-heading text-lg font-semibold">
              This year's topic: the UNCRC
            </h3>
            <p className="text-sm">
              This year STF at Van Nuys is focusing on the Convention on the
              Rights of the Child! We'll develop an action plan and petition
              administrators to get a campus-wide ratification.
            </p>
            <Link
              className="text-red-800 underline underline-offset-2"
              to="/posts/$slug"
              params={{ slug: "topic" }}
            >
              Find out more
            </Link>
          </div>
        </div>
        <div>
          <img
            className="aspect-video w-full object-cover"
            src={humanRightsImage}
            alt="People gathering at a nighttime protest with signs"
          />
          <div className="flex flex-col gap-2 px-2 py-4">
            <h3 className="font-heading text-lg font-semibold">
              What are human rights?
            </h3>
            <p className="text-sm">
              You've definitely heard about them. But what are human rights? And
              why should we care about them at school?
            </p>
            <Link
              className="text-red-800 underline underline-offset-2"
              to="/posts/$slug"
              params={{ slug: "human-rights" }}
            >
              Find out more
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
