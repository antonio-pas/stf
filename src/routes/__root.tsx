import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex flex-col min-h-svh">
          <div className="w-full border-b border-black">
            <div className="max-w-5xl w-full mx-auto flex gap-8 px-6 h-16 items-center"><Link to="/"
              activeProps={{ className: "" }} className="font-bold font-heading after:aboslute after:bottom-0 after:left-0 after:content-[''] after:h-1 after:w-full after:bg-black">
              Student Task Force
            </Link>
              <Link to="/" className="ml-auto text-sm">
                This year's topic
              </Link>
              <Link to="/" className="text-sm">
                What are human rights?
              </Link>
              <Link to="/" className="text-sm">
                Meeting slides
              </Link>
            </div>
          </div>
          <div className="max-w-5xl px-6 mx-auto w-full flex flex-col gap-4 mt-20">{children}</div>
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
