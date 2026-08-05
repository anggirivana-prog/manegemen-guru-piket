import { useState, useEffect } from 'react';
import { User } from '../types';
import { localStorageService } from '../services/storage';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return localStorageService.getCurrentUser();
  });

  useEffect(() => {
    localStorageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    localStorageService.setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'Admin';
  const isOperator = currentUser?.role === 'Operator';
  const isGuru = currentUser?.role === 'Guru';

  return {
    currentUser,
    setCurrentUser,
    logout,
    isAdmin,
    isOperator,
    isGuru,
    role: currentUser?.role,
  };
}
