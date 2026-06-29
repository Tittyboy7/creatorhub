import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableCompareWidget({ id, title, subtitle, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-60" : ""}
    >
      <div
        {...attributes}
        {...listeners}
        className="mb-3 flex cursor-grab items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 active:cursor-grabbing"
      >
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>

          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-500">
          Drag
        </span>
      </div>

      {children}
    </div>
  );
}