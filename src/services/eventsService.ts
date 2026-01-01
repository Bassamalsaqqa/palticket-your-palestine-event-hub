import { mockEvents, categories as mockCategories, cities as mockCities } from "@/data/mockEvents";
import { type Event, type Category, type City, type EventFilters, type TicketTier } from "@/types/domain";
import { apiFetch, getApiConfig, getLanguage } from "./apiClient";

const LATENCY = 300;
const FALLBACK_IMAGE = "/placeholder.svg";
const ORGANIZER_NAME = "PalTicket";

const CATEGORY_STYLE_BY_SLUG: Record<
  string,
  { icon: string; color: string }
> = {
  music: { icon: "Music", color: "hsl(var(--primary))" },
  sports: { icon: "Trophy", color: "hsl(var(--accent))" },
  arts: { icon: "Palette", color: "hsl(var(--gold))" },
  food: { icon: "UtensilsCrossed", color: "hsl(20, 60%, 50%)" },
  business: { icon: "Briefcase", color: "hsl(200, 50%, 45%)" },
  family: { icon: "Users", color: "hsl(145, 60%, 40%)" },
  nightlife: { icon: "Moon", color: "hsl(270, 50%, 50%)" },
  comedy: { icon: "Laugh", color: "hsl(45, 90%, 50%)" },
  festivals: { icon: "PartyPopper", color: "hsl(330, 70%, 55%)" },
  workshops: { icon: "GraduationCap", color: "hsl(180, 50%, 45%)" },
};

type ApiTranslation = {
  locale: "en" | "ar";
  name: string;
  summary?: string | null;
  description?: string | null;
};

type ApiEvent = {
  id: string;
  slug: string;
  startTime: string;
  endTime?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  translations: ApiTranslation[];
  category?: { slug: string; translations: { locale: "en" | "ar"; name: string }[] } | null;
  city?: { slug: string; translations: { locale: "en" | "ar"; name: string }[] } | null;
  venue?: {
    id: string;
    translations: { locale: "en" | "ar"; name: string; address?: string | null; city?: string | null }[];
  } | null;
};

type ApiTicketType = {
  id: string;
  name: string;
  sellPriceCents: number;
  quantity: number;
  currency: string;
};

type ApiCategory = {
  id: string;
  slug: string;
  translations: { locale: "en" | "ar"; name: string }[];
};

type ApiCity = {
  id: string;
  slug: string;
  translations: { locale: "en" | "ar"; name: string }[];
};

const simulateLatency = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, LATENCY);
  });
};

const makeLocalized = (value?: string | null) => {
  const text = value ?? "";
  return { en: text, ar: text };
};

const pickTranslation = <T extends { locale?: string }>(
  translations: T[] = [],
  lang: "en" | "ar",
) => {
  return (
    translations.find((t) => t.locale === lang) ||
    translations.find((t) => t.locale === "en") ||
    translations[0]
  );
};

const mapStatus = (status: ApiEvent["status"], startTime: string, endTime?: string | null) => {
  if (status === "CANCELLED") return "cancelled" as const;
  const now = new Date();
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;
  if (start > now) return "upcoming" as const;
  if (end && end < now) return "past" as const;
  return "ongoing" as const;
};

const mapTicketTier = (ticket: ApiTicketType): TicketTier => {
  return {
    id: ticket.id,
    name: makeLocalized(ticket.name),
    price: Math.round(ticket.sellPriceCents / 100),
    available: ticket.quantity,
    total: ticket.quantity,
  };
};

const mapEvent = (event: ApiEvent, lang: "en" | "ar", ticketTiers: TicketTier[] = []): Event => {
  const translation = pickTranslation(event.translations, lang);
  const venueTranslation = pickTranslation(event.venue?.translations, lang);
  const categoryTranslation = pickTranslation(event.category?.translations, lang);
  const cityTranslation = pickTranslation(event.city?.translations, lang);
  const datePart = event.startTime.split("T")[0] || "";
  const timePart = event.startTime.split("T")[1]?.slice(0, 5) || "";
  const endDatePart = event.endTime?.split("T")[0];

  return {
    id: event.id,
    slug: event.slug,
    title: makeLocalized(translation?.name),
    description: makeLocalized(
      translation?.description || translation?.summary || "",
    ),
    category: event.category?.slug || "",
    images: [FALLBACK_IMAGE],
    date: datePart,
    time: timePart,
    endDate: endDatePart,
    venue: {
      name: makeLocalized(venueTranslation?.name),
      address: makeLocalized(venueTranslation?.address),
      city: makeLocalized(venueTranslation?.city || cityTranslation?.name),
    },
    organizer: {
      name: makeLocalized(ORGANIZER_NAME),
    },
    ticketTiers,
    featured: false,
    status: mapStatus(event.status, event.startTime, event.endTime),
  };
};

const fetchTicketTiers = async (eventId: string): Promise<TicketTier[]> => {
  try {
    const config = getApiConfig();
    if (!config) return [];
    const tickets = await apiFetch<ApiTicketType[]>(
      `/ticket-types?eventId=${encodeURIComponent(eventId)}&skip=0&take=100`,
    );
    return tickets.map(mapTicketTier);
  } catch {
    return [];
  }
};

export const fetchEventById = async (id: string, lang?: "en" | "ar"): Promise<Event | undefined> => {
  const activeLang = lang || getLanguage();
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(mockEvents.find((event) => event.id === id));
  }

  try {
    const event = await apiFetch<ApiEvent>(`/events/${encodeURIComponent(id)}?lang=${activeLang}`);
    const ticketTiers = await fetchTicketTiers(event.id);
    return mapEvent(event, activeLang, ticketTiers);
  } catch {
    return simulateLatency(mockEvents.find((event) => event.id === id));
  }
};

export const fetchAllEvents = async (lang?: "en" | "ar"): Promise<Event[]> => {
  const activeLang = lang || getLanguage();
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(mockEvents);
  }

  try {
    const events = await apiFetch<ApiEvent[]>(`/events?lang=${activeLang}`);
    const enriched = await Promise.all(
      events.map(async (event) => {
        const ticketTiers = await fetchTicketTiers(event.id);
        return mapEvent(event, activeLang, ticketTiers);
      }),
    );
    return enriched;
  } catch {
    return simulateLatency(mockEvents);
  }
};

export const fetchFeaturedEvents = async (lang?: "en" | "ar"): Promise<Event[]> => {
  const events = await fetchAllEvents(lang);
  return events.slice(0, 3);
};

export const fetchEventBySlug = async (slug: string, lang?: "en" | "ar"): Promise<Event | undefined> => {
  const activeLang = lang || getLanguage();
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(mockEvents.find((event) => event.slug === slug));
  }

  try {
    const event = await apiFetch<ApiEvent>(`/events/slug/${encodeURIComponent(slug)}?lang=${activeLang}`);
    const ticketTiers = await fetchTicketTiers(event.id);
    return mapEvent(event, activeLang, ticketTiers);
  } catch {
    return simulateLatency(mockEvents.find((event) => event.slug === slug));
  }
};

export const fetchCategories = async (lang?: "en" | "ar"): Promise<Category[]> => {
  const activeLang = lang || getLanguage();
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(mockCategories);
  }

  try {
    const categories = await apiFetch<ApiCategory[]>(`/categories?lang=${activeLang}`);
    return categories.map((category) => {
      const translation = pickTranslation(category.translations, activeLang);
      const style = CATEGORY_STYLE_BY_SLUG[category.slug] || {
        icon: "Tag",
        color: "hsl(var(--primary))",
      };
      return {
        id: category.slug,
        name: makeLocalized(translation?.name),
        icon: style.icon,
        color: style.color,
      };
    });
  } catch {
    return simulateLatency(mockCategories);
  }
};

export const fetchCities = async (lang?: "en" | "ar"): Promise<City[]> => {
  const activeLang = lang || getLanguage();
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(mockCities);
  }

  try {
    const cities = await apiFetch<ApiCity[]>(`/cities?lang=${activeLang}`);
    return cities.map((city) => {
      const translation = pickTranslation(city.translations, activeLang);
      return {
        id: city.slug,
        name: makeLocalized(translation?.name),
      };
    });
  } catch {
    return simulateLatency(mockCities);
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  const config = getApiConfig();
  if (!config) return;

  try {
    await apiFetch(`/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.warn("Failed to delete event via API", error);
    throw error;
  }
};

export const createEvent = async (data: {
  translations: { locale: 'en' | 'ar', name: string, description?: string, summary?: string }[],
  slug: string,
  venueId?: string,
  categoryId?: string,
  cityId?: string,
  startTime: string,
  endTime?: string
}): Promise<{ id: string }> => {
  const config = getApiConfig();
  if (!config) return { id: `mock-${Date.now()}` };

  return await apiFetch<{ id: string }>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateEvent = async (id: string, data: {
  translations?: { locale: 'en' | 'ar', name: string, description?: string, summary?: string }[],
  slug?: string,
  venueId?: string,
  categoryId?: string,
  cityId?: string,
  startTime?: string,
  endTime?: string,
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED"
}): Promise<{ id: string }> => {
  const config = getApiConfig();
  if (!config) return { id };

  return await apiFetch<{ id: string }>(`/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const filterEvents = async (filters: EventFilters, lang?: "en" | "ar"): Promise<Event[]> => {
  const activeLang = lang || getLanguage();
  const events = await fetchAllEvents(activeLang);
  const needTicketPrices = filters.priceMin !== undefined || filters.priceMax !== undefined;

  const eventsWithPrices = needTicketPrices
    ? await Promise.all(
        events.map(async (event) => {
          if (event.ticketTiers.length > 0) {
            return event;
          }
          const tiers = await fetchTicketTiers(event.id);
          return { ...event, ticketTiers: tiers };
        }),
      )
    : events;

  const filtered = eventsWithPrices.filter((event) => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.city && event.venue.city.en.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.dateFrom && event.date < filters.dateFrom) return false;
    if (filters.dateTo && event.date > filters.dateTo) return false;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const minPrice = event.ticketTiers.length
        ? Math.min(...event.ticketTiers.map((t) => t.price))
        : 0;
      if (filters.priceMin !== undefined && minPrice < filters.priceMin) return false;
      if (filters.priceMax !== undefined && minPrice > filters.priceMax) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle =
        event.title.en.toLowerCase().includes(searchLower) ||
        event.title.ar.includes(filters.search);
      const matchesVenue =
        event.venue.name.en.toLowerCase().includes(searchLower) ||
        event.venue.name.ar.includes(filters.search);
      if (!matchesTitle && !matchesVenue) return false;
    }
    return true;
  });
  return filtered;
};
