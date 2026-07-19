import React, { forwardRef, useId } from 'react';

const Select = forwardRef(({ label, options = [], error, hint, required, className = '', id, ...rest }, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full appearance-none bg-white border rounded-md px-3 py-2 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors
            ${error ? 'border-danger-500 text-danger-900 focus:ring-danger-500' : 'border-neutral-200 hover:border-neutral-300'}
          `}
          {...rest}
        >
          {(!rest.value && !rest.defaultValue) && (
            <option value="">Select...</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-neutral-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
