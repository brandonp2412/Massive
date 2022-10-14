import React, {useContext} from 'react';

export const Color = React.createContext({
  color: '',
  setColor: (_value: string) => {},
});

export const useColor = () => {
  const context = useContext(Color);
  return context;
};
