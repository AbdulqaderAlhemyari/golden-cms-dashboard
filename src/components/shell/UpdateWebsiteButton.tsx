"use client";

import { useState } from "react";
import { toast } from "sonner";
import { revalidateWebsite } from "@/lib/api/publish";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

type UpdateWebsiteButtonProps = {
  variant?: "sidebar" | "compact";
  className?: string;
};

export function UpdateWebsiteButton({
  variant = "sidebar",
  className,
}: UpdateWebsiteButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await revalidateWebsite();
      toast.success(copy.updateWebsiteSuccess);
    } catch (error) {
      toast.error(copy.updateWebsiteFailure);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        className={cn("btn-secondary text-sm", className)}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? copy.updating : copy.updateWebsite}
      </button>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        className="btn-primary w-full"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? copy.updating : copy.updateWebsite}
      </button>
      <p className="px-1 text-xs leading-relaxed text-muted">
        {copy.updateWebsiteHelp}
      </p>
    </div>
  );
}
