import { useState, ReactNode } from "react";
import { UserRole } from "@/types/domain";
import { generateUserId } from "./authUtils";
import { AuthContext, AuthContextType } from "./AuthContextDef";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff" || isAdmin;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (email && password.length >= 6) {
      let role: UserRole = "user";
      if (email.startsWith("admin")) role = "admin";
      else if (email.startsWith("staff")) role = "staff";

      setUser({
        id: generateUserId(email),
        email,
        firstName: "Ahmad",
        lastName: "Hassan",
        phone: "+970599123456",
        role,
      });
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: "Invalid email or password" };
  };

  const signup = async (data: { email: string; password: string; firstName: string; lastName: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (data.email && data.password.length >= 6) {
      setUser({
        id: generateUserId(data.email),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "user", // Default role
      });
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: "Failed to create account" };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<AuthContextType["user"]>) => {
    if (user) {
      setUser({ ...user, ...data } as AuthContextType["user"]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isStaff,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}