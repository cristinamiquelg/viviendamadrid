"use client";

type Item = { code: string; name: string; color: string };

export default function SelectedChips({
  items,
  onRemove,
}: {
  items: Item[];
  onRemove: (code: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Selecciona barrios en el mapa o con el buscador para ver su evolución.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onRemove(item.code)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-1)] py-1 pl-1.5 pr-2.5 text-xs text-[var(--text-primary)] hover:bg-[var(--page)]"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          {item.name}
          <span className="text-[var(--text-muted)]">×</span>
        </button>
      ))}
    </div>
  );
}
