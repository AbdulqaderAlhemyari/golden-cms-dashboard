"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import { cn } from "@/lib/cn";

type RichTextFieldProps = {
  label?: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
};

export function RichTextField({
  label = copy.richText,
  helpText = fields.richTextHelp,
  value,
  onChange,
}: RichTextFieldProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-40 px-3 py-2 text-sm leading-relaxed outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
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

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex flex-wrap gap-1 border-b border-border bg-background px-2 py-1.5">
          <ToolbarButton
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            label={fields.richBold}
          />
          <ToolbarButton
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            label={fields.richBulletList}
          />
          <ToolbarButton
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            label={fields.richOrderedList}
          />
        </div>
        <EditorContent editor={editor} />
      </div>
      {helpText ? (
        <p className="text-xs leading-relaxed text-muted">{helpText}</p>
      ) : null}
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
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-semibold",
        active ? "bg-orange-50 text-primary" : "text-muted hover:bg-slate-100",
      )}
    >
      {label}
    </button>
  );
}
