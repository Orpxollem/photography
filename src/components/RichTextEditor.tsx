import { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function hasHtmlTags(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

function plainTextToHtml(text: string): string {
  const lines = text.split('\n').filter((p) => p.trim());
  return lines.map((p) => `<p>${p}</p>`).join('');
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = '120px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  // Sync external value changes into the editor (e.g. initial load)
  useEffect(() => {
    if (!editorRef.current || skipSync.current) {
      skipSync.current = false;
      return;
    }
    const html = hasHtmlTags(value) ? value : plainTextToHtml(value);
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [value]);

  const applyFormat = (command: 'bold' | 'italic') => {
    editorRef.current?.focus();
    // execCommand is deprecated but remains the simplest cross-browser
    // approach for inline formatting in contentEditable
    document.execCommand(command, false);
    if (editorRef.current) {
      skipSync.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      skipSync.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div>
      {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden focus-within:border-neutral-500 transition">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-neutral-700 bg-neutral-800/60">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('bold');
            }}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-white hover:bg-neutral-700 transition font-bold text-sm"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('italic');
            }}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-white hover:bg-neutral-700 transition italic text-sm"
            title="Italic"
          >
            I
          </button>
          <span className="ml-2 text-neutral-600 text-xs select-none">Select text, then click B or I</span>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          className="rich-editor px-4 py-3 text-white outline-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
