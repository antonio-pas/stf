import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/topic')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1 className="font-heading text-4xl lg:text-5xl font-semibold mb-4">What are human rights?</h1>
      <h2 className="font-heading text-2xl lg:text-4xl font-medium mb-12">A deep dive into the definition of human rights.</h2>

      <p>
        The United Nations define human rights as 
      </p>
    </div>
  )
}
