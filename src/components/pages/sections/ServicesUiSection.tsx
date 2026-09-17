"use client";

import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";

export type ServicesUiValue = {
  know_more?: string;
  close?: string;
};

type Props = {
  value: ServicesUiValue;
  onChange: (value: ServicesUiValue) => void;
};

export function ServicesUiSection({ value, onChange }: Props) {
  const current = value ?? {};

  return (
    <div className="space-y-5">
      <TextField
        label={fields.servicesUi.knowMore}
        name="services-know-more"
        value={current.know_more ?? ""}
        onChange={(e) => onChange({ ...current, know_more: e.target.value })}
      />
      <TextField
        label={fields.servicesUi.close}
        name="services-close"
        value={current.close ?? ""}
        onChange={(e) => onChange({ ...current, close: e.target.value })}
      />
    </div>
  );
}
