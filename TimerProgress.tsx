import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ProgressBar } from "react-native-paper";
import { emitter } from "./emitter";
import { TickEvent } from "./TimerPage";

export default function TimerProgress() {
  const [progress, setProgress] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const description = emitter.addListener(
        "tick",
        ({ minutes, seconds }: TickEvent) => {
          setProgress((Number(minutes) * 60 + Number(seconds)) / 210);
          console.log({ minutes, seconds });
        }
      );
      return description.remove;
    }, [])
  );

  if (progress === 0) return null;

  return (
    <ProgressBar
      style={{
        position: "absolute",
        bottom: 0,
      }}
      progress={progress}
    />
  );
}
