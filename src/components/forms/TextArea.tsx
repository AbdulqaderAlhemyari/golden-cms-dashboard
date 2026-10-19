"use client";

import type { TextareaHTMLAttributes } from "react";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { LocaleScriptHint } from "@/components/forms/LocaleScriptHint";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import { cn } from "@/lib/cn";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helpText?: string;
  error?: string;
  /** Detect Arabic/English typed in the wrong language tab. Default true. */
  checkScript?: boolean;
  /** Override active language tab for script detection. */
  scriptLocale?: ContentLocale;
};

export function TextArea({
  label,
  helpText,
  error,
  id,
  className,
  rows = 4,
  checkScript = true,
  scriptLocale,
  value,
  defaultValue,
  ...props
}: TextAreaProps) {
  const fieldId = id ?? props.name;
  const currentValue = value ?? defaultValue ?? "";

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
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
      <LocaleScriptHint
        value={currentValue}
        enabled={checkScript && !error}
        locale={scriptLocale}
      />
    </div>
  );
}
