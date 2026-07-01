import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import WidgetActionMenu from "@/components/compare/WidgetActionMenu";

export default function SortableCompareWidget({
  id,
  title,
  subtitle,
  size,
  onResize,
  onFocus,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  children,
}) {
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
      className={`${isDragging ? "opacity-60" : ""} ${
        Number(size || 1) >= 3
          ? "md:col-span-2 xl:col-span-3"
          : Number(size || 1) === 2
          ? "md:col-span-2 xl:col-span-2"
          : ""
      }`}
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

        <div
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <WidgetActionMenu
            onEdit={() => onEdit?.(id)}
            onFocus={() => onFocus?.(id)}
            onDuplicate={() => onDuplicate?.(id)}
            onExport={() => onExport?.(id)}
            onDelete={() => onDelete?.(id)}
          />
        </div>
      </div>

      <div className="relative">
        {children}

        <button
          type="button"
         onClick={() => {
          const currentWidth = Number(size || 1);
          const nextWidth = currentWidth >= 3 ? 1 : currentWidth + 1;
          const nextHeight = nextWidth === 3 ? 2 : 1;

          onResize?.(id, {
            width: nextWidth,
            height: nextHeight,
          });
        }}
          className="absolute bottom-3 right-3 h-5 w-5 rounded-br-2xl border-b-2 border-r-2 border-zinc-500 hover:border-white"
          aria-label="Resize widget"
        />
      </div>
    </div>
  );
}