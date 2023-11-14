import { ComponentProps } from "react";
import { FAB } from "react-native-paper";

export default function AppFab(props: Partial<ComponentProps<typeof FAB>>) {
  return (
    <FAB
      icon="plus"
      testID="add"
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
      }}
      {...props}
    />
  );
}
