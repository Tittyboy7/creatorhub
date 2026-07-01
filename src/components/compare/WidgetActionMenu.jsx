import { useState, useRef, useEffect } from "react";

export default function WidgetActionMenu({
  onEdit,
  onFocus,
  onDuplicate,
  onExport,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = [
    { label: "✏️ Edit Widget", onClick: onEdit },
    { label: "🔍 Focus", onClick: onFocus },
    { label: "📄 Duplicate", onClick: onDuplicate },
    { label: "📤 Export", onClick: onExport },
    {
      label: "🗑 Delete",
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full border border-zinc-700 px-3 py-1 text-lg leading-none text-zinc-400 hover:bg-zinc-800 hover:text-white"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/40">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onClick?.();
              }}
              className={`flex w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                action.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}