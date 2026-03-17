import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          placeholder-gray-400 shadow-sm focus:border-[var(--colour-primary)]
          focus:outline-none focus:ring-1 focus:ring-[var(--colour-primary)]
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
