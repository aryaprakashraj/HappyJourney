import React from 'react';

/**
 * Page-level header. Accepts either a JSX element or a config object
 * for the `action` slot so both usage styles work.
 *
 * Usage with JSX:
 *   <PageHeader title="Vehicles" action={<Button onClick={...}>Add</Button>} />
 *
 * Usage with config object (legacy):
 *   <PageHeader title="Vehicles" action={{ label: 'Add', onClick: fn }} />
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-semibold text-neutral-900 leading-snug">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div>
          {/* Accept both a plain JSX element and a {label, onClick} config */}
          {React.isValidElement(action) ? action : null}
        </div>
      )}
    </div>
  );
}
