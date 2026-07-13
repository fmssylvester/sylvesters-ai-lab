export default function Scene1Silhouette() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "8%",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 0.08,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <svg
        width="280"
        height="360"
        viewBox="0 0 280 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="140" cy="80" rx="55" ry="65" fill="white" />
        <path
          d="M40 340 C40 280, 80 210, 140 200 C200 210, 240 280, 240 340"
          fill="white"
        />
        <path
          d="M100 130 C100 110, 120 90, 140 90 C160 90, 180 110, 180 130"
          fill="white"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
