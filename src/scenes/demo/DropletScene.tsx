import DropletFlow from "../../modules/droplet-flow/DropletFlow";
import DropletBackground from "../../modules/droplet-flow/DropletBackground";

export default function DropletScene() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Floating space layer */}
      <DropletBackground />

      {/* Main flow */}
      <DropletFlow
        items={[
          {
            title: "Perception Layer",
            description: "AI interprets input signals",
          },
          {
            title: "Reasoning Layer",
            description: "AI processes decisions",
          },
          {
            title: "Action Layer",
            description: "AI executes outputs",
          },
          {
            title: "Memory Layer",
            description: "AI stores context",
          },
        ]}
      />
    </div>
  );
}
