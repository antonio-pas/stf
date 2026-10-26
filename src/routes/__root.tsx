import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { InstagramIcon, JusticeScaleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
        title: "Van Nuys Student Task Force",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
      },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="mt-20">
      <h1 className="mb-8 text-center font-heading text-3xl font-bold lg:text-4xl">
        Oops!
      </h1>
      <h2 className="mb-5 text-center font-heading text-2xl font-medium lg:text-3xl">
        We couldn't find that page.
      </h2>
      <p className="text-center">
        Sorry! We couldn't find what you were looking for.{" "}
        <Link className="text-red-800 underline underline-offset-2" to="/">
          Return home?
        </Link>
      </p>
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
        <div className="flex min-h-svh flex-col">
          <div className="w-full border-b-2 border-black">
            <div className="mx-auto flex min-h-16 w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
              <Link
                to="/"
                activeProps={{ className: "" }}
                className="font-heading flex gap-4 items-center font-bold"
              >
              <HugeiconsIcon size={20} strokeWidth={2} icon={JusticeScaleIcon} />
                Student Task Force
              </Link>
              <nav
                aria-label="Main navigation"
                className="ml-auto flex flex-wrap items-center justify-end gap-x-6 gap-y-3 text-sm"
              >
                <Link
                  to="/posts/$slug"
                  params={{ slug: "topic" }}
                  className="text-sm"
                  activeProps={{ className: "font-bold" }}
                >
                  This year's topic
                </Link>
                <Link
                  to="/posts/$slug"
                  params={{ slug: "human-rights" }}
                  className="text-sm"
                  activeProps={{ className: "font-bold" }}
                >
                  What are human rights?
                </Link>
                <Link
                  to="/sbrr-progress"
                  className="text-sm"
                  activeProps={{ className: "font-bold" }}
                >
                  SBRR Progress
                </Link>
              </nav>
            </div>
          </div>
          <div className="mx-auto mt-20 flex w-full max-w-5xl flex-col gap-4 px-6">
            {children}
          </div>
          <footer className="flex mt-20 w-full items-center justify-center border-t-2 border-black py-16">
            <div className="grid w-full max-w-5xl gap-4 px-6 md:grid-cols-2">
              <div>© 2026 VNHS STF. All rights reserved.</div>
              <a
                className="inline-flex items-center gap-2 font-semibold"
                href="https://www.instagram.com/vnhsstff"
              >
                <HugeiconsIcon size={20} strokeWidth={2} icon={InstagramIcon} />
                Instagram
              </a>
            </div>
          </footer>
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
