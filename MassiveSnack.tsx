import React, {useContext, useState} from 'react';
import {Snackbar} from 'react-native-paper';
import {CustomTheme} from './App';

export const SnackbarContext = React.createContext<{
  toast: (value: string, timeout: number) => void;
}>({toast: () => null});

export default function MassiveSnack({
  children,
}: {
  children?: JSX.Element[] | JSX.Element;
}) {
  const [snackbar, setSnackbar] = useState('');
  const [timeoutId, setTimeoutId] = useState(0);
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
          color,
        }}>
        {snackbar}
      </Snackbar>
    </>
  );
}
