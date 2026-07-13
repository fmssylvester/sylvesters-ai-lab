import RevealList from "../../modules/reveal-list/RevealList";

export default function DemoScene() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <RevealList
        items={[
          {
            title: "Perception Layer",
            description: "How AI interprets input data",
          },
          {
            title: "Reasoning Layer",
            description: "How decisions are formed",
          },
          {
            title: "Action Layer",
            description: "How outputs are executed",
          },
          {
            title: "Feedback Loop",
            description: "How systems improve over time",
          },
        ]}
      />
    </div>
  );
}
