import { JSX } from "preact";
import { forwardRef } from "preact/compat";
import { useState } from "preact/hooks";

interface InputProps
  extends Omit<JSX.HTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "floating";
  size?: "sm" | "md" | "lg";
  type?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = "default",
  size = "md",
  type = "text",
  className = "",
  value,
  ...props
}, ref) => {
  const [hasValue, setHasValue] = useState(!!value);

  const baseClasses =
    "w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const errorClasses = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 dark:border-gray-600";

  const classes = `${baseClasses} ${
    sizeClasses[size]
  } ${errorClasses} ${className}`;

  const handleChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setHasValue(!!target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  if (variant === "floating") {
    return (
      <div
        className={`input-custom input-floating ${hasValue ? "has-value" : ""}`}
      >
        <input
          ref={ref}
          type={type}
          className={classes}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {label && (
          <label className="floating-label">
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={classes}
        value={value}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
