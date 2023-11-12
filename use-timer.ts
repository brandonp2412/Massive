import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { NativeModules } from "react-native";
import { emitter } from "./emitter";
import { TickEvent } from "./TimerPage";

export default function useTimer() {
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  const update = () => {
    const current: number = NativeModules.AlarmModule.getCurrent();
    setMinutes(
      Math.floor(current / 1000 / 60)
        .toString()
        .padStart(2, "0")
    );
    setSeconds(
      Math.floor((current / 1000) % 60)
        .toString()
        .padStart(2, "0")
    );
  };

  useFocusEffect(
    useCallback(() => {
      update();
      const listener = emitter.addListener("tick", (event: TickEvent) => {
        console.log(`${useTimer.name}.tick:`, { event });
        setMinutes(event.minutes);
        setSeconds(event.seconds);
      });
      return listener.remove;
    }, [])
  );

  return { minutes, seconds, update };
}
