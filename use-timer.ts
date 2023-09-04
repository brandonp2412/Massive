import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { emitter } from "./emitter";
import { TickEvent } from "./TimerPage";

export default function useTimer() {
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  useFocusEffect(
    useCallback(() => {
      setMinutes("00");
      setSeconds("00");
      const listener = emitter.addListener("tick", (event: TickEvent) => {
        console.log(`${useTimer.name}.tick:`, { event });
        setMinutes(event.minutes);
        setSeconds(event.seconds);
      });
      return listener.remove;
    }, [])
  );

  return { minutes, seconds };
}
