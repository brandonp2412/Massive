import React, {useState} from 'react';
import {useColorScheme} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {CombinedDarkTheme, CombinedDefaultTheme} from './App';

export const SnackbarContext = React.createContext<{
  toast: (value: string, timeout: number) => void;
}>({toast: () => null});

const MassiveSnack = ({children}: {children: JSX.Element[] | JSX.Element}) => {
  const [snackbar, setSnackbar] = useState('');
  const dark = useColorScheme() === 'dark';
  let timeoutId: number;

  const toast = (value: string, timeout: number) => {
    setSnackbar(value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setSnackbar(''), timeout);
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
          color: dark
            ? CombinedDarkTheme.colors.background
            : CombinedDefaultTheme.colors.primary,
        }}>
        {snackbar}
      </Snackbar>
    </>
  );
};

export default MassiveSnack;
