import { apiFetch, getApiConfig } from "./apiClient";

const mockTicketTypes = [
  { id: "1", name: "VIP", price: 200, events: 5, color: "#8b5cf6" },
  { id: "2", name: "Regular", price: 75, events: 8, color: "#3b82f6" },
];

type ApiTicketType = {
  id: string;
  name: string;
  sellPriceCents: number;
};

interface UI_TicketType {
  id: string;
  name: string;
  price: number;
  events: number;
  color: string;
}

export const fetchAllTicketTypes = async (): Promise<UI_TicketType[]> => {
  const config = getApiConfig();
  if (!config) return mockTicketTypes;

  try {
    const types = await apiFetch<ApiTicketType[]>("/ticket-types?skip=0&take=100");
    return types.map(t => ({
      id: t.id,
      name: t.name,
      price: Math.round(t.sellPriceCents / 100),
      events: 1, // Simple mapping for now
      color: "#3b82f6",
    }));
  } catch {
    return mockTicketTypes;
  }
};

export const deleteTicketType = async (id: string): Promise<void> => {
  const config = getApiConfig();
  if (!config) return;
  await apiFetch(`/ticket-types/${encodeURIComponent(id)}`, { method: "DELETE" });
};

export const createTicketType = async (data: {
  eventId: string;
  name: string;
  sellPriceCents: number;
  partnerPriceCents: number;
  currency: string;
  quantity: number;
}): Promise<{ id: string }> => {
  const config = getApiConfig();
  if (!config) return { id: `mock-${Date.now()}` };

  return await apiFetch<{ id: string }>("/ticket-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
