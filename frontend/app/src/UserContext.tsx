import { createContext, useState, useEffect, ReactNode } from 'react';
import config from './config'

interface UserProviderProps {
  isAuthenticated: boolean;
  children: ReactNode
}

interface AuthenticatedUser {
  name: string;
  email: string;
}

const UserContext = createContext<AuthenticatedUser | null>(null);

const UserProvider: React.FC<UserProviderProps> = ({ isAuthenticated, children }: UserProviderProps) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiURL}/user/current-user`, {headers: {Authorization: `Bearer ${token}`}});
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
