import React, {useState} from 'react';
import {useColorScheme} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {CombinedDarkTheme, CombinedDefaultTheme} from './App';

export const SnackbarContext = React.createContext<{
  toast: (value: string, timeout: number) => void;
}>({toast: () => null});

const MassiveSnack = ({children}: {children: JSX.Element[] | JSX.Element}) => {
  const [snackbar, setSnackbar] = useState('');
  const [timeoutId, setTimeoutId] = useState(0);
  const dark = useColorScheme() === 'dark';

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
