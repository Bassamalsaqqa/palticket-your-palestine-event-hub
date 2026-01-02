import { createContext } from "react";
import { MockUser } from "@/types/domain";

export interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; firstName: string; lastName: string }, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<MockUser>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
