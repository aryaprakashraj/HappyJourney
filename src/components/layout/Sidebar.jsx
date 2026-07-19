import { NavLink } from 'react-router-dom'
import { useSidebar } from '@/contexts/SidebarContext'

/**
 * Sidebar — lives BELOW the navbar in the layout body.
 *
 * Expanded  → 260px: icon (18px) + label
 * Collapsed →  72px: icon (18px) only, centered. Same icon size always.
 *
 * h-full fills the flex body (viewport minus navbar).
 * transition-all animates width change at 200ms ease.
 */
export default function Sidebar({ navItems = [], footer }) {
  const { isCollapsed } = useSidebar()

  return (
    <aside
      className={`
        flex flex-col shrink-0 h-full bg-white border-r border-neutral-200
        transition-all duration-200 ease-in-out
        ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-4"
        aria-label="Sidebar navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              [
                'flex items-center w-full transition-colors duration-150 text-[13.5px]',
                isCollapsed
                  ? 'justify-center py-3'
                  : 'gap-3 py-2.5 px-3 mx-2 rounded-lg',
                isActive
                  ? isCollapsed
                    ? 'text-accent-600'
                    : 'bg-neutral-100 text-neutral-900 font-semibold'
                  : isCollapsed
                  ? 'text-neutral-400 hover:text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon — locked at 18×18 in both states */}
                <span
                  className={`flex items-center justify-center shrink-0 h-[18px] w-[18px] ${
                    isActive ? 'text-accent-600' : ''
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                {/* Label — only when expanded */}
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer slot — only when expanded */}
      {footer && !isCollapsed && (
        <div className="border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600 truncate">
          {footer}
        </div>
      )}
    </aside>
  )
}
