import { ComponentProps } from "react";
import { Button, useTheme } from "react-native-paper";

type PrimaryButtonProps = Omit<Partial<ComponentProps<typeof Button>>, "mode">;

export default function PrimaryButton(props: PrimaryButtonProps) {
  const { colors } = useTheme();

  return (
    <Button mode="contained" textColor={colors.background} {...props}>
      {props.children}
    </Button>
  );
}
