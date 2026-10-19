import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  as?: "label" | "p";
};

/** Shared field title styling (smaller / muted vs value text). */
export function FieldLabel({
  children,
  htmlFor,
  className,
  as = "label",
}: FieldLabelProps) {
  if (as === "p") {
    return <p className={cn("field-label", className)}>{children}</p>;
  }

  return (
    <label htmlFor={htmlFor} className={cn("field-label", className)}>
      {children}
    </label>
  );
}
