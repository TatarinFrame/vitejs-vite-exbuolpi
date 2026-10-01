import React, { createContext, useContext, useState, useEffect } from 'react';

// Добавьте безопасное чтение из localStorage с try-catch
const getInitialUser = () => {
  try {
    const item = localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Ошибка чтения пользователя из localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthContext = createContext(/* ... */);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};