import { createContext, useContext, useState, ReactNode } from "react";

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  eventId: string;
  eventSlug: string;
  eventTitle: { en: string; ar: string };
  eventDate: string;
  eventVenue: { en: string; ar: string };
  eventImage: string;
  tickets: {
    tierId: string;
    tierName: { en: string; ar: string };
    quantity: number;
    price: number;
  }[];
  total: number;
  purchaseDate: string;
  status: "confirmed" | "pending" | "cancelled" | "refunded";
}

export interface MockTicket {
  id: string;
  orderId: string;
  ticketNumber: string;
  eventId: string;
  eventSlug: string;
  eventTitle: { en: string; ar: string };
  eventDate: string;
  eventTime: string;
  eventVenue: { en: string; ar: string };
  eventImage: string;
  tierName: { en: string; ar: string };
  attendeeName: string;
  qrCode: string;
  status: "valid" | "used" | "expired" | "cancelled";
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<MockUser>) => void;
  orders: MockOrder[];
  tickets: MockTicket[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data
const mockOrders: MockOrder[] = [
  {
    id: "ord-1",
    orderNumber: "PAL-2025-001234",
    eventId: "1",
    eventSlug: "mahmoud-darwish-poetry-night",
    eventTitle: { en: "Mahmoud Darwish Poetry Night", ar: "ليلة شعر محمود درويش" },
    eventDate: "2025-02-14",
    eventVenue: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    tickets: [
      { tierId: "regular", tierName: { en: "Regular", ar: "عادي" }, quantity: 2, price: 75 },
    ],
    total: 150,
    purchaseDate: "2025-01-15",
    status: "confirmed",
  },
  {
    id: "ord-2",
    orderNumber: "PAL-2025-001235",
    eventId: "2",
    eventSlug: "palestinian-food-festival",
    eventTitle: { en: "Palestinian Food Festival 2025", ar: "مهرجان الطعام الفلسطيني 2025" },
    eventDate: "2025-03-21",
    eventVenue: { en: "Manger Square, Bethlehem", ar: "ساحة المهد، بيت لحم" },
    eventImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    tickets: [
      { tierId: "weekend-pass", tierName: { en: "Weekend Pass", ar: "تذكرة نهاية الأسبوع" }, quantity: 1, price: 60 },
    ],
    total: 60,
    purchaseDate: "2025-01-20",
    status: "confirmed",
  },
];

const mockTickets: MockTicket[] = [
  {
    id: "tkt-1",
    orderId: "ord-1",
    ticketNumber: "TKT-001234-A",
    eventId: "1",
    eventSlug: "mahmoud-darwish-poetry-night",
    eventTitle: { en: "Mahmoud Darwish Poetry Night", ar: "ليلة شعر محمود درويش" },
    eventDate: "2025-02-14",
    eventTime: "19:00",
    eventVenue: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    tierName: { en: "Regular", ar: "عادي" },
    attendeeName: "Ahmad Hassan",
    qrCode: "PALTICKET-TKT-001234-A-VALID",
    status: "valid",
  },
  {
    id: "tkt-2",
    orderId: "ord-1",
    ticketNumber: "TKT-001234-B",
    eventId: "1",
    eventSlug: "mahmoud-darwish-poetry-night",
    eventTitle: { en: "Mahmoud Darwish Poetry Night", ar: "ليلة شعر محمود درويش" },
    eventDate: "2025-02-14",
    eventTime: "19:00",
    eventVenue: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    tierName: { en: "Regular", ar: "عادي" },
    attendeeName: "Sara Khalil",
    qrCode: "PALTICKET-TKT-001234-B-VALID",
    status: "valid",
  },
  {
    id: "tkt-3",
    orderId: "ord-2",
    ticketNumber: "TKT-001235-A",
    eventId: "2",
    eventSlug: "palestinian-food-festival",
    eventTitle: { en: "Palestinian Food Festival 2025", ar: "مهرجان الطعام الفلسطيني 2025" },
    eventDate: "2025-03-21",
    eventTime: "11:00",
    eventVenue: { en: "Manger Square, Bethlehem", ar: "ساحة المهد، بيت لحم" },
    eventImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    tierName: { en: "Weekend Pass", ar: "تذكرة نهاية الأسبوع" },
    attendeeName: "Ahmad Hassan",
    qrCode: "PALTICKET-TKT-001235-A-VALID",
    status: "valid",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (email && password.length >= 6) {
      setUser({
        id: "user-1",
        email,
        firstName: "Ahmad",
        lastName: "Hassan",
        phone: "+970599123456",
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
        id: "user-new",
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
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

  const updateProfile = (data: Partial<MockUser>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        orders: user ? mockOrders : [],
        tickets: user ? mockTickets : [],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
