import { createFileRoute, Link } from "@tanstack/react-router"
import childrenImage from "@/assets/children.jpg"
import humanRightsImage from "@/assets/human-rights.webp"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="">
      <h1 className="font-heading text-5xl lg:text-6xl font-semibold mb-4">Student Task Force</h1>
      <h2 className="font-heading text-2xl lg:text-4xl font-medium mb-12">Protecting human rights at Van Nuys</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="aspect-5/8">
          <img className="h-1/2 object-cover" src={childrenImage} />
          <div className="flex flex-col px-2 py-4 gap-2">
            <h3 className="font-heading text-lg font-semibold">This year's topic: the UNCRC</h3>
            <p className="text-sm">This year STF at Van Nuys is focusing on the Convention of the Rights of the Child! We'll develop an action plan and petition administrators to get a campus-wide ratification.</p>
            <Link
              className="text-red-800 underline underline-offset-2"
              to="/topic"
            >
              Find out more
            </Link>
          </div>
        </div>
        <div className="aspect-5/8">
          <img className="h-1/2 object-cover" src={humanRightsImage} />
          <div className="flex flex-col px-2 py-4 gap-2">
            <h3 className="font-heading text-lg font-semibold">What are human rights?</h3>
            <p className="text-sm">You've definitely heard about them. But what are human rights? And why should we care about them at school?</p>
            <Link
              className="text-red-800 underline underline-offset-2"
              to="/human-rights"
            >
              Find out more
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
