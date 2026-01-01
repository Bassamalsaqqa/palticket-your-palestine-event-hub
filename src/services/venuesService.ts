import { apiFetch, getApiConfig, getLanguage } from "./apiClient";

export interface VenueOption {
  id: string;
  name: string;
}

interface ApiVenue {
  id: string;
  translations?: {
    name: string;
  }[];
}

export const fetchAllVenues = async (lang?: "en" | "ar"): Promise<VenueOption[]> => {
  const activeLang = lang || getLanguage();
  const config = getApiConfig();
  
  if (!config) {
    return [
      { id: "1", name: "Ramallah Cultural Palace" },
      { id: "2", name: "Manger Square, Bethlehem" },
    ];
  }

  try {
    const venues = await apiFetch<ApiVenue[]>(`/venues?lang=${activeLang}&skip=0&take=100`);
    return venues.map(v => ({
      id: v.id,
      name: v.translations?.[0]?.name || "Unnamed Venue",
    }));
  } catch (error) {
    console.warn("Failed to fetch venues, falling back to mock", error);
    return [
      { id: "1", name: "Ramallah Cultural Palace" },
      { id: "2", name: "Manger Square, Bethlehem" },
    ];
  }
};
