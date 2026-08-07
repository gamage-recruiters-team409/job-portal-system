import { useId, useState } from 'react';

/**
 * Labeled input with an inline error message and an optional
 * show/hide toggle for password fields.
 *
 * Design: 48px height, labels above the field, red border + message on error.
 *
 * @param {object} props
 * @param {import('react-hook-form').UseFormRegisterReturn} props.registration
 *   The object returned by `form.register('field')`.
 */
export default function FormInput({
  label,
  registration,
  error,
  type = 'text',
  placeholder,
  autoComplete,
}) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
          }`}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-sm text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
