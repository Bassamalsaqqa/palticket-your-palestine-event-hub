export type UserRole = "admin" | "staff" | "user";

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}

export interface MockOrder {
  id: string;
  userId: string;
  orderNumber: string;
  eventId: string;
  eventSlug: string;
  eventTitle: { en: string; ar: string };
  eventDate: string;
  eventTime: string;
  eventVenue: { en: string; ar: string };
  eventImage: string;
  attendeeName: string;
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
  userId: string;
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
  scanHistory?: {
    scannedAt: string;
    result: string;
    gateName?: string;
  }[];
}

export interface TicketTier {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  price: number;
  available: number;
  total: number;
  description?: {
    en: string;
    ar: string;
  };
}

export interface Event {
  id: string;
  slug: string;
  venueId?: string;
  categoryId?: string;
  cityId?: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  category: string;
  categorySlug?: string;
  citySlug?: string;
  images: string[];
  date: string;
  time: string;
  endDate?: string;
  venue: {
    name: {
      en: string;
      ar: string;
    };
    address: {
      en: string;
      ar: string;
    };
    city: {
      en: string;
      ar: string;
    };
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  organizer: {
    name: {
      en: string;
      ar: string;
    };
    logo?: string;
  };
  ticketTiers: TicketTier[];
  featured: boolean;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
}

export interface Category {
  id: string;
  slug: string;
  name: {
    en: string;
    ar: string;
  };
  icon: string;
  color: string;
}

export interface City {
  id: string;
  slug: string;
  name: {
    en: string;
    ar: string;
  };
}

export interface Gate {
  id: string;
  name: string;
  eventId: string;
  scansToday?: number;
  status: "active" | "inactive";
}

export interface EventFilters {
  category?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}
