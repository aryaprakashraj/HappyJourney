import { Link } from 'react-router-dom'
import { APP_NAME, ROUTES } from '@/constants'
import Button from '@/components/ui/Button'

const FEATURES = [
  {
    title: 'Fleet Oversight',
    desc: 'Track every vehicle — status, assignments, and history — from one place.',
  },
  {
    title: 'Driver Management',
    desc: 'Assign drivers to vehicles and maintain a complete assignment audit trail.',
  },
  {
    title: 'Journey Booking',
    desc: 'Passengers search, filter, and book journeys in seconds.',
  },
  {
    title: 'Real-time Status',
    desc: 'Journeys move from scheduled → ongoing → completed with full detail tracking.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="border-b border-neutral-200 bg-neutral-50/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-600">
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="8" r="2" fill="white" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-neutral-900">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm" id="landing-signin-btn">
                Sign in
              </Button>
            </Link>
            <Link to={ROUTES.SIGNUP}>
              <Button variant="primary" size="sm" id="landing-signup-btn">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Fleet Management Platform
          </span>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 leading-tight mb-5">
            Vehicle journeys,
            <br />
            <span className="text-neutral-500">managed end-to-end.</span>
          </h1>

          <p className="max-w-xl mx-auto text-base text-neutral-500 leading-relaxed mb-10">
            {APP_NAME} gives fleet operators full control over vehicles, drivers,
            and journeys — while passengers book their seats in just a few clicks.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to={ROUTES.SIGNUP}>
              <Button variant="primary" size="lg" id="hero-signup-btn">
                Start booking
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="secondary" size="lg" id="hero-signin-btn">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Feature grid ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-24" aria-label="Features">
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-neutral-200 [&>*:nth-child(odd)]:sm:border-r [&>*:nth-child(odd)]:sm:border-neutral-200">
              {FEATURES.map((f) => (
                <div key={f.title} className="p-6">
                  <h2 className="text-sm font-semibold text-neutral-900 mb-1.5">
                    {f.title}
                  </h2>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 py-6 text-center">
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} {APP_NAME}. Built with React + Supabase.
        </p>
      </footer>
    </div>
  )
}
