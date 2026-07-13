import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  height?: string;
}

export default function BrowserContent({
  children,
  height = "calc(100% - 140px)",
}: Props) {
  return (
    <div
      style={{
        flex: 1,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
