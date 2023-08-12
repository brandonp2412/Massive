import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import {
  DefaultTheme,
  MD3DarkTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { ThemeContext } from "./use-theme";

export const MockProviders = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => (
  <PaperProvider settings={{ icon: (props) => <MaterialIcon {...props} /> }}>
    <ThemeContext.Provider
      value={{
        theme: "system",
        setTheme: jest.fn(),
        lightColor: DefaultTheme.colors.primary,
        darkColor: MD3DarkTheme.colors.primary,
        setLightColor: jest.fn(),
        setDarkColor: jest.fn(),
      }}
    >
      <NavigationContainer>{children}</NavigationContainer>
    </ThemeContext.Provider>
  </PaperProvider>
);
