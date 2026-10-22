"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { LocaleScriptHint } from "@/components/forms/LocaleScriptHint";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

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
  type = "text",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  const currentValue = value ?? defaultValue ?? "";
  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = isPassword && passwordVisible ? "text" : type;

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "field-input",
            isPassword && "pe-11",
            error && "border-danger focus:border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined
          }
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setPasswordVisible((v) => !v)}
            disabled={props.disabled}
            aria-label={
              passwordVisible ? copy.hidePassword : copy.showPassword
            }
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? (
              <EyeOff className="size-5" aria-hidden />
            ) : (
              <Eye className="size-5" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
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
