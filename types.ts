
export type TransactionType = 'income' | 'expense';

export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  STUDY = 'Study',
  SHOPPING = 'Shopping',
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  GIFT = 'Gift',
  OTHERS = 'Others'
}

export interface UserProfile {
  name: string;
  avatar: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  note: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

export interface AppState {
  user: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  theme: 'light' | 'dark';
  pin: string | null;
  isLocked: boolean;
}
