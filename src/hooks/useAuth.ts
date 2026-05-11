import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getUserByEmail, createUser } from '../lib/db';

const USER_STORAGE_KEY = 'stockwatch_current_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existingUser));
        setUser(existingUser);
        return { success: true };
      } else {
        return { success: false, error: 'No account found with this email. Please sign up.' };
      }
    } catch {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (email: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      
      const newUser = {
        id: crypto.randomUUID(),
        email,
        name,
      };
      
      await createUser(newUser.id, newUser.email, newUser.name);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, signup, logout };
}
