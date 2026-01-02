import { useState, ReactNode } from "react";
import { UserRole } from "@/types/domain";
import { generateUserId } from "./authUtils";
import { AuthContext, AuthContextType } from "./AuthContextDef";

// Safe storage helpers
const storage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("LocalStorage access denied", e);
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("LocalStorage write failed", e);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("LocalStorage remove failed", e);
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(() => {
    try {
      const storedUser = storage.get("auth_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse stored user", error);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff" || isAdmin;

  const login = async (email: string, password: string, remember: boolean = true): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (email && password.length >= 6) {
      let role: UserRole = "user";
      if (email.startsWith("admin")) role = "admin";
      else if (email.startsWith("staff")) role = "staff";

      const newUser = {
        id: generateUserId(email),
        email,
        firstName: "Ahmad",
        lastName: "Hassan",
        phone: "+970599123456",
        role,
      };

      setUser(newUser);
      
      if (remember) {
        storage.set("auth_user", JSON.stringify(newUser));
      } else {
        storage.remove("auth_user");
      }
      
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: "Invalid email or password" };
  };

  const signup = async (data: { email: string; password: string; firstName: string; lastName: string }, remember: boolean = true): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (data.email && data.password.length >= 6) {
      const newUser = {
        id: generateUserId(data.email),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "user" as UserRole, // Default role
      };

      setUser(newUser);
      
      if (remember) {
        storage.set("auth_user", JSON.stringify(newUser));
      } else {
        storage.remove("auth_user");
      }
      
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: "Failed to create account" };
  };

  const logout = () => {
    setUser(null);
    storage.remove("auth_user");
  };

  const updateProfile = (data: Partial<AuthContextType["user"]>) => {
    if (user) {
      const updatedUser = { ...user, ...data } as AuthContextType["user"];
      setUser(updatedUser);
      // Only update storage if user was already stored (implies "remember me" was checked)
      if (storage.get("auth_user")) {
        storage.set("auth_user", JSON.stringify(updatedUser));
      }
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