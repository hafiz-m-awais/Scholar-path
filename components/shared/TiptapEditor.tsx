"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Quote, Undo, Redo } from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white flex flex-col">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded ${editor.isActive("bold") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded ${editor.isActive("italic") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded ${editor.isActive("bulletList") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded ${editor.isActive("orderedList") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded ${editor.isActive("blockquote") ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="flex-1 overflow-y-auto cursor-text" />
    </div>
  );
}
