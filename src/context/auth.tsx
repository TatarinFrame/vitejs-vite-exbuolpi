import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  name?: string;
  avatarUrl?: string;
}

interface AuthValue {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
}

const getInitialUser = (): User | null => {
  try {
    const item = localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
