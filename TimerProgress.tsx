import { useEffect, useState } from "react";
import { ProgressBar } from "react-native-paper";
import { TickEvent } from "./TimerPage";
import { emitter } from "./emitter";

export default function TimerProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const description = emitter.addListener(
      "tick",
      ({ minutes, seconds }: TickEvent) => {
        setProgress((Number(minutes) * 60 + Number(seconds)) / 210);
      }
    );
    return description.remove;
  }, []);

  if (progress === 0) return null;

  return (
    <ProgressBar
      style={{
        position: "absolute",
        bottom: 0,
        height: 5,
      }}
      progress={progress}
    />
  );
}
