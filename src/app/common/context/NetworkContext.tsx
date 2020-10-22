import * as React from 'react';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';
import { AxiosError } from 'axios';
import { useHistory } from 'react-router-dom';

export interface INetworkContext {
  setSelfSignedCertUrl: (url: string) => void;
  selfSignedCertUrl: string;
  saveLoginToken: (user: string) => void;
  currentUser: string;
  checkExpiry: (error: Response | AxiosError<unknown>) => void;
}

const NetworkContext = React.createContext<INetworkContext>({
  selfSignedCertUrl: '',
  setSelfSignedCertUrl: () => {
    console.error('setSelfSignedCertUrl was called without a NetworkContextProvider in the tree');
  },
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a NetworkContextProvider in the tree');
  },
  currentUser: '',
  checkExpiry: () => {
    console.error('checkExpiry was called without a NetworkContextProvider in the tree');
  },
});

interface INetworkContextProviderProps {
  children: React.ReactNode;
}

export const NetworkContextProvider: React.FunctionComponent<INetworkContextProviderProps> = ({
  children,
}: INetworkContextProviderProps) => {
  const [selfSignedCertUrl, setSelfSignedCertUrl] = React.useState('');
  const [currentUser, setCurrentUser] = useLocalStorageContext(LocalStorageKey.currentUser);
  const history = useHistory();

  const saveLoginToken = (user: string | null) => {
    setCurrentUser(JSON.stringify(user));
    history.push('/');
  };

  const checkExpiry = (error: Response | AxiosError<unknown>) => {
    const status = (error as Response).status || (error as AxiosError<unknown>).response?.status;
    if (status === 401) {
      setCurrentUser('');
      history.push('/');
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        selfSignedCertUrl,
        setSelfSignedCertUrl,
        saveLoginToken,
        currentUser: currentUser || '',
        checkExpiry,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): INetworkContext => React.useContext(NetworkContext);
