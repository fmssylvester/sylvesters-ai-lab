interface ToolCard {
  icon: string;
  name: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

interface ToolGridProps {
  tools: ToolCard[];
  columns?: number;
}

export default function ToolGrid({ tools, columns = 4 }: ToolGridProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#F8F9FA",
        padding: 32,
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1A1A1E",
            marginBottom: 6,
          }}
        >
          AI Tools Directory
        </div>
        <div style={{ fontSize: 14, color: "#6B7280" }}>
          Discover the best AI tools for your workflow
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {["All", "Text", "Image", "Video", "Code", "Audio"].map((f, i) => (
          <div
            key={f}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              background: i === 0 ? "#1A1A1E" : "#E5E7EB",
              color: i === 0 ? "#FFFFFF" : "#6B7280",
              cursor: "pointer",
            }}
          >
            {f}
          </div>
        ))}
      </div>

      {/* Tool grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
        }}
      >
        {tools.map((tool, i) => (
          <ToolCardComponent key={i} tool={tool} />
        ))}
      </div>
    </div>
  );
}

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #E5E7EB",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {tool.icon}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#1A1A1E",
        }}
      >
        {tool.name}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          color: "#6B7280",
          lineHeight: 1.4,
        }}
      >
        {tool.description}
      </div>

      {/* Tag */}
      {tool.tag && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            background: tool.tagColor || "#EEF2FF",
            color: tool.tagColor ? "#FFFFFF" : "#4F46E5",
          }}
        >
          {tool.tag}
        </div>
      )}
    </div>
  );
}
