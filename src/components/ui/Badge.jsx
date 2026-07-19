import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const baseStyle = 'inline-flex items-center rounded-full font-medium';
  
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5'
  };

  const variantStyles = {
    default: 'bg-white text-neutral-600 border border-neutral-300',
    success: 'bg-success-500/10 text-success-500 border border-success-500/20',
    warning: 'bg-warning-500/10 text-warning-500 border border-warning-500/20',
    danger: 'bg-danger-500/10 text-danger-400 border border-danger-500/20',
    info: 'bg-accent-500/10 text-accent-400 border border-accent-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
  };

  return (
    <span className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, type }) {
  if (!status) return null;

  let variant = 'default';

  switch (type) {
    case 'vehicle':
      if (status === 'available') variant = 'success';
      else if (status === 'booked') variant = 'warning';
      else if (status === 'on-journey') variant = 'info';
      else if (status === 'maintenance') variant = 'danger';
      break;
    case 'driver':
      if (status === 'available') variant = 'success';
      else if (status === 'on-duty') variant = 'info';
      else if (status === 'off') variant = 'default';
      break;
    case 'journey':
      if (status === 'scheduled') variant = 'info';
      else if (status === 'ongoing') variant = 'success';
      else if (status === 'completed') variant = 'default';
      else if (status === 'cancelled') variant = 'danger';
      break;
    case 'booking':
      if (status === 'confirmed') variant = 'success';
      else if (status === 'cancelled') variant = 'danger';
      else if (status === 'completed') variant = 'default';
      break;
    default:
      variant = 'default';
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}
