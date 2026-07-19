import React from 'react';

const variantStyles = {
  default: 'text-neutral-900',
  success: 'text-success-500',
  info: 'text-accent-600',
  warning: 'text-warning-500',
}

export default function StatCard({ label, value, description, variant = 'default' }) {
  return (
    <div className="stat-card">
      <p className="text-[12px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
        {label}
      </p>
      <p className={`text-[32px] font-light leading-none ${variantStyles[variant] || variantStyles.default}`}>
        {value}
      </p>
      {description && (
        <p className="text-[12px] text-neutral-400 mt-2">{description}</p>
      )}
    </div>
  );
}
