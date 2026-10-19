"use client";

import type { InputHTMLAttributes } from "react";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { LocaleScriptHint } from "@/components/forms/LocaleScriptHint";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helpText?: string;
  error?: string;
  /** Detect Arabic/English typed in the wrong language tab. Default true. */
  checkScript?: boolean;
  /** Override active language tab for script detection. */
  scriptLocale?: ContentLocale;
};

export function TextField({
  label,
  helpText,
  error,
  id,
  className,
  checkScript = true,
  scriptLocale,
  value,
  defaultValue,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  const currentValue = value ?? defaultValue ?? "";

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <input
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
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
      <LocaleScriptHint
        value={currentValue}
        enabled={checkScript && !error}
        locale={scriptLocale}
      />
    </div>
  );
}
