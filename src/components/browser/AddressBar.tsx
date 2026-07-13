interface Props {
  url?: string;
  focused?: boolean;
}

export default function AddressBar({
  url = "https://sylvesters-ai-lab.dev",
  focused = false,
}: Props) {
  return (
    <div
      style={{
        marginLeft: 28,
        flex: 1,
        height: 34,
        borderRadius: 12,
        background: focused
          ? "rgba(255,255,255,0.1)"
          : "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 18,
        fontSize: 15,
        color: "#94A3B8",
        transition: "background 0.3s ease",
        border: focused ? "1px solid rgba(0,217,255,0.3)" : "1px solid transparent",
      }}
    >
      {url}
    </div>
  );
}
