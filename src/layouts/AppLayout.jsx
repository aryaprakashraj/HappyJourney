import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

/**
 * AppLayout — the correct layout architecture:
 *
 *  +-----------------------------------------------------+
 *  |               TOP NAVBAR  (full width)              |
 *  +--------+--------------------------------------------+
 *  | SIDEBAR|                                            |
 *  |        |           PAGE CONTENT                     |
 *  |        |                                            |
 *  +--------+--------------------------------------------+
 *
 * The navbar is a fixed strip at top spanning 100% width.
 * The body below it is a flex row: sidebar + scrollable content.
 * Collapsing the sidebar ONLY affects the content area width.
 * The navbar NEVER moves, shifts, or resizes.
 */
export default function AppLayout({ navItems }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-neutral-50">
      {/* ── Navbar — full width, never moves ──────────────── */}
      <TopBar />

      {/* ── Body — sidebar + content, below the navbar ──── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — starts below navbar, scrolls independently */}
        <Sidebar navItems={navItems} />

        {/* Content — expands/contracts as sidebar collapses */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
