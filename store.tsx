
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Transaction, Budget, Goal, Category, UserProfile } from './types';

interface AppContextType {
  state: AppState;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (category: Category, limit: number) => void;
  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, amount: number) => void;
  updateUser: (user: UserProfile) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPin: (pin: string | null) => void;
  setLocked: (isLocked: boolean) => void;
  importData: (data: string) => void;
}

const STORAGE_KEY = 'fintrack_pro_data';

const DEFAULT_BUDGETS: Budget[] = [
  { category: Category.FOOD, limit: 5000 },
  { category: Category.TRANSPORT, limit: 2000 },
  { category: Category.STUDY, limit: 1000 },
  { category: Category.SHOPPING, limit: 3000 },
  { category: Category.OTHERS, limit: 1000 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...parsed, 
        isLocked: !!parsed.pin,
        user: parsed.user || { name: 'Guest User', avatar: null }
      };
    }
    return {
      user: { name: 'Guest User', avatar: null },
      transactions: [],
      budgets: DEFAULT_BUDGETS,
      goals: [],
      theme: 'light',
      pin: null,
      isLocked: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, isLocked: false }));
  }, [state]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const updateBudget = (category: Category, limit: number) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.category === category ? { ...b, limit } : b)
    }));
  };

  const addGoal = (g: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount: amount } : g)
    }));
  };

  const updateUser = (user: UserProfile) => {
    setState(prev => ({ ...prev, user }));
  };

  const setTheme = (theme: 'light' | 'dark') => setState(prev => ({ ...prev, theme }));
  const setPin = (pin: string | null) => setState(prev => ({ ...prev, pin }));
  const setLocked = (isLocked: boolean) => setState(prev => ({ ...prev, isLocked }));

  const importData = (json: string) => {
    try {
      const data = JSON.parse(json);
      setState({ ...data, isLocked: !!data.pin });
    } catch (e) {
      alert("Invalid backup file.");
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, addTransaction, deleteTransaction, updateBudget, 
      addGoal, updateGoal, updateUser, setTheme, setPin, setLocked, importData 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
