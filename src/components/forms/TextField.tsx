import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helpText?: string;
  error?: string;
};

export function TextField({
  label,
  helpText,
  error,
  id,
  className,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "field-input",
          error && "border-danger focus:border-danger",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined
        }
        {...props}
      />
      {helpText && !error ? (
        <p id={`${fieldId}-help`} className="text-xs leading-relaxed text-muted">
          {helpText}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
