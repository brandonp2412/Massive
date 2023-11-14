import { ComponentProps } from "react";
import { FAB, useTheme } from "react-native-paper";

export default function AppFab(props: Partial<ComponentProps<typeof FAB>>) {
  const { colors } = useTheme();

  return (
    <FAB
      icon="plus"
      testID="add"
      color={colors.background}
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        backgroundColor: colors.primary,
      }}
      {...props}
    />
  );
}
