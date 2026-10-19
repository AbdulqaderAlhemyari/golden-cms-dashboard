"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useReducer } from "react";
import { FieldLabel } from "@/components/forms/FieldLabel";
import { LocaleScriptHint } from "@/components/forms/LocaleScriptHint";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import { cn } from "@/lib/cn";

type RichTextFieldProps = {
  label?: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
  checkScript?: boolean;
};

export function RichTextField({
  label = copy.richText,
  helpText = fields.richTextHelp,
  value,
  onChange,
  checkScript = true,
}: RichTextFieldProps) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class:
          "rich-text-editor min-h-40 px-3 py-2 text-base font-medium leading-relaxed outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    onSelectionUpdate: () => {
      rerender();
    },
    onTransaction: () => {
      rerender();
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && next !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(next || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const boldActive = Boolean(editor?.isActive("bold"));
  const bulletActive = Boolean(editor?.isActive("bulletList"));
  const orderedActive = Boolean(editor?.isActive("orderedList"));

  return (
    <div className="space-y-1.5">
      <FieldLabel as="p">{label}</FieldLabel>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div
          className="flex flex-wrap gap-1.5 border-b border-border bg-background px-2 py-1.5"
          role="toolbar"
          aria-label={fields.richTextHelp}
        >
          <ToolbarButton
            active={boldActive}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            label={fields.richBold}
          />
          <ToolbarButton
            active={bulletActive}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            label={fields.richBulletList}
          />
          <ToolbarButton
            active={orderedActive}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            label={fields.richOrderedList}
          />
        </div>
        <EditorContent editor={editor} />
      </div>
      {helpText ? (
        <p className="text-xs leading-relaxed text-muted">{helpText}</p>
      ) : null}
      <LocaleScriptHint value={value} enabled={checkScript} />
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(active)}
      /* Keep editor selection — otherwise bold/list never apply to highlighted text */
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "min-h-8 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-transparent bg-surface text-muted ring-1 ring-border hover:bg-orange-50 hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}
