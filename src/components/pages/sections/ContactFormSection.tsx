"use client";

import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";

export type ContactFormValue = {
  heading?: string;
  name?: string;
  name_placeholder?: string;
  email?: string;
  email_placeholder?: string;
  phone?: string;
  phone_placeholder?: string;
  subject?: string;
  message?: string;
  submit?: string;
  sending?: string;
  success?: string;
  error?: string;
  modal_ok?: string;
  success_title?: string;
  error_title?: string;
};

type Props = {
  value: ContactFormValue;
  onChange: (value: ContactFormValue) => void;
};

export function ContactFormSection({ value, onChange }: Props) {
  const current = value ?? {};

  function set(key: keyof ContactFormValue, text: string) {
    onChange({ ...current, [key]: text });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">{fields.contactForm.help}</p>
      <TextField
        label={fields.contactForm.heading}
        name="cf-heading"
        value={current.heading ?? ""}
        onChange={(e) => set("heading", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fields.contactForm.name}
          name="cf-name"
          value={current.name ?? ""}
          onChange={(e) => set("name", e.target.value)}
        />
        <TextField
          label={fields.contactForm.namePlaceholder}
          name="cf-name-ph"
          value={current.name_placeholder ?? ""}
          onChange={(e) => set("name_placeholder", e.target.value)}
        />
        <TextField
          label={fields.contactForm.email}
          name="cf-email"
          value={current.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
        />
        <TextField
          label={fields.contactForm.emailPlaceholder}
          name="cf-email-ph"
          value={current.email_placeholder ?? ""}
          onChange={(e) => set("email_placeholder", e.target.value)}
        />
        <TextField
          label={fields.contactForm.phone}
          name="cf-phone"
          value={current.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
        />
        <TextField
          label={fields.contactForm.phonePlaceholder}
          name="cf-phone-ph"
          value={current.phone_placeholder ?? ""}
          onChange={(e) => set("phone_placeholder", e.target.value)}
        />
      </div>
      <TextField
        label={fields.contactForm.subject}
        name="cf-subject"
        value={current.subject ?? ""}
        onChange={(e) => set("subject", e.target.value)}
      />
      <TextField
        label={fields.contactForm.message}
        name="cf-message"
        value={current.message ?? ""}
        onChange={(e) => set("message", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fields.contactForm.submit}
          name="cf-submit"
          value={current.submit ?? ""}
          onChange={(e) => set("submit", e.target.value)}
        />
        <TextField
          label={fields.contactForm.sending}
          name="cf-sending"
          value={current.sending ?? ""}
          onChange={(e) => set("sending", e.target.value)}
        />
        <TextField
          label={fields.contactForm.successTitle}
          name="cf-success-title"
          value={current.success_title ?? ""}
          onChange={(e) => set("success_title", e.target.value)}
        />
        <TextField
          label={fields.contactForm.success}
          name="cf-success"
          value={current.success ?? ""}
          onChange={(e) => set("success", e.target.value)}
        />
        <TextField
          label={fields.contactForm.errorTitle}
          name="cf-error-title"
          value={current.error_title ?? ""}
          onChange={(e) => set("error_title", e.target.value)}
        />
        <TextField
          label={fields.contactForm.error}
          name="cf-error"
          value={current.error ?? ""}
          onChange={(e) => set("error", e.target.value)}
        />
        <TextField
          label={fields.contactForm.modalOk}
          name="cf-modal-ok"
          value={current.modal_ok ?? ""}
          onChange={(e) => set("modal_ok", e.target.value)}
        />
      </div>
    </div>
  );
}
