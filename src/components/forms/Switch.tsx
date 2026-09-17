"use client";

import { cn } from "@/lib/cn";

type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
  disabled?: boolean;
  id?: string;
};

export function Switch({
  label,
  checked,
  onChange,
  helpText,
  disabled = false,
  id,
}: SwitchProps) {
  const fieldId = id ?? label;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-foreground"
        >
          {label}
        </label>
        {helpText ? (
          <p className="text-xs leading-relaxed text-muted">{helpText}</p>
        ) : null}
      </div>
      <button
        id={fieldId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-slate-300",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
            checked ? "end-0.5" : "start-0.5",
          )}
        />
      </button>
    </div>
  );
}
