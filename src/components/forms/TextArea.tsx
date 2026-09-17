import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helpText?: string;
  error?: string;
};

export function TextArea({
  label,
  helpText,
  error,
  id,
  className,
  rows = 4,
  ...props
}: TextAreaProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className={cn(
          "field-input min-h-28 resize-y py-3",
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
