// contexts/UserContext.js
import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();


export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);

  // Al iniciar, leer usuario de localStorage si existe
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUserState(JSON.parse(stored));
    }
  }, []);

  // setUser que también guarda en localStorage
  const setUser = (u) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
