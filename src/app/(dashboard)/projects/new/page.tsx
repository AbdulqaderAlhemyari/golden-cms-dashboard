"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { Switch } from "@/components/forms/Switch";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";

export default function NewProjectPage() {
  const [showOnHome, setShowOnHome] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <PlaceholderScreen>
      <div className="card-surface mx-auto w-full max-w-2xl space-y-6 p-6">
        <TextField
          label={copy.projectName}
          name="title"
          placeholder={copy.projectNamePlaceholder}
          helpText={copy.projectNameHelp}
        />
        <TextArea
          label={copy.description}
          name="description"
          helpText={copy.descriptionHelp}
        />
        <Switch
          label={copy.showOnHome}
          checked={showOnHome}
          onChange={setShowOnHome}
          helpText={copy.featuredWarning}
        />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" className="btn-primary" disabled>
            {copy.save}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirmOpen(true)}
          >
            {copy.delete}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={copy.delete}
        description={copy.confirmDelete}
        confirmLabel={copy.delete}
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />
    </PlaceholderScreen>
  );
}
