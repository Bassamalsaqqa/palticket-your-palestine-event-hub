import { mockEvents, categories, cities } from "@/data/mockEvents";
import { type Event, type Category, type City, type EventFilters } from "@/types/domain";

const LATENCY = 300;

const simulateLatency = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, LATENCY);
  });
};

export const fetchAllEvents = async (): Promise<Event[]> => {
  return simulateLatency(mockEvents);
};

export const fetchFeaturedEvents = async (): Promise<Event[]> => {
  return simulateLatency(mockEvents.filter((event) => event.featured));
};

export const fetchEventBySlug = async (slug: string): Promise<Event | undefined> => {
  return simulateLatency(mockEvents.find((event) => event.slug === slug));
};

export const fetchCategories = async (): Promise<Category[]> => {
  return simulateLatency(categories);
};

export const fetchCities = async (): Promise<City[]> => {
  return simulateLatency(cities);
};

export const filterEvents = async (filters: EventFilters): Promise<Event[]> => {
  const filtered = mockEvents.filter((event) => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.city && event.venue.city.en.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.dateFrom && event.date < filters.dateFrom) return false;
    if (filters.dateTo && event.date > filters.dateTo) return false;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const minPrice = Math.min(...event.ticketTiers.map((t) => t.price));
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
  return simulateLatency(filtered);
};
