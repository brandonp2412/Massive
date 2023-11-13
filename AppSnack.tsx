import React, { useEffect, useState } from "react";
import { Snackbar } from "react-native-paper";
import { emitter } from "./emitter";
import { TOAST } from "./toast";

export default function AppSnack({ textColor }: { textColor: string }) {
  const [snackbar, setSnackbar] = useState("");

  useEffect(() => {
    const description = emitter.addListener(
      TOAST,
      ({ value }: { value: string }) => {
        setSnackbar(value);
      }
    );
    return description.remove;
  }, []);

  return (
    <Snackbar
      duration={3000}
      onDismiss={() => setSnackbar("")}
      visible={!!snackbar}
      action={{
        label: "Close",
        onPress: () => setSnackbar(""),
        textColor,
      }}
    >
      {snackbar}
    </Snackbar>
  );
}
