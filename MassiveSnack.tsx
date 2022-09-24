import React, {useContext, useState} from 'react';
import {useColorScheme} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {CombinedDarkTheme, CustomTheme} from './App';

export const SnackbarContext = React.createContext<{
  toast: (value: string, timeout: number) => void;
}>({toast: () => null});

export default function MassiveSnack({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) {
  const [snackbar, setSnackbar] = useState('');
  const [timeoutId, setTimeoutId] = useState(0);
  const dark = useColorScheme() === 'dark';
  const {color} = useContext(CustomTheme);

  const toast = (value: string, timeout: number) => {
    setSnackbar(value);
    clearTimeout(timeoutId);
    const id = setTimeout(() => setSnackbar(''), timeout);
    setTimeoutId(id);
  };

  return (
    <>
      <SnackbarContext.Provider value={{toast}}>
        {children}
      </SnackbarContext.Provider>
      <Snackbar
        onDismiss={() => setSnackbar('')}
        visible={!!snackbar}
        action={{
          label: 'Close',
          onPress: () => setSnackbar(''),
          color: dark ? CombinedDarkTheme.colors.background : color,
        }}>
        {snackbar}
      </Snackbar>
    </>
  );
}
