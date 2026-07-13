interface Bookmark {
  label: string;
  color?: string;
}

interface Props {
  items: Bookmark[];
  fillProgress: number;
}

export default function BookmarkStrip({ items, fillProgress }: Props) {
  const visibleCount = Math.round(items.length * fillProgress);

  return (
    <div
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "0 12px",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {items.slice(0, Math.min(visibleCount, 18)).map((item, i) => {
        const isOverlapping = visibleCount > 10 && i >= 10;
        return (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              fontSize: 11,
              color: "#94A3B8",
              whiteSpace: "nowrap",
              transition: "all 0.3s ease",
              opacity: isOverlapping ? 0.6 : 1,
              transform: isOverlapping ? `translateX(${-(i - 10) * 4}px)` : "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: item.color || "#3B82F6",
                flexShrink: 0,
              }}
            />
            {!isOverlapping && <span>{item.label}</span>}
          </div>
        );
      })}
    </div>
  );
}
