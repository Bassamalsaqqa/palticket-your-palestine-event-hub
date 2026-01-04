import { apiFetch, getApiConfig } from "./apiClient";

const mockTicketTypes = [
  { id: "1", name: "VIP", price: 200, events: 5, color: "#8b5cf6" },
  { id: "2", name: "Regular", price: 75, events: 8, color: "#3b82f6" },
];

type ApiTicketType = {
  id: string;
  name: string;
  sellPriceCents: number;
  partnerPriceCents: number;
  currency: string;
  quantity: number;
  eventId: string;
};

export interface UI_TicketType {
  id: string;
  name: string;
  price: number;
  partnerPrice: number;
  currency: string;
  quantity: number;
  eventId: string;
  color: string;
  events?: number; // Keep for mock compatibility
}

export const fetchAllTicketTypes = async (): Promise<UI_TicketType[]> => {
  const config = getApiConfig();
  if (!config) return mockTicketTypes.map(t => ({ ...t, partnerPrice: t.price * 0.9, currency: "ILS", quantity: 100, eventId: "mock-event" }));

  try {
    const types = await apiFetch<ApiTicketType[]>("/ticket-types?skip=0&take=100");
    return types.map(t => ({
      id: t.id,
      name: t.name,
      price: Math.round(t.sellPriceCents / 100),
      partnerPrice: Math.round(t.partnerPriceCents / 100),
      currency: t.currency,
      quantity: t.quantity,
      eventId: t.eventId,
      color: "#3b82f6",
    }));
  } catch {
    return mockTicketTypes.map(t => ({ ...t, partnerPrice: t.price * 0.9, currency: "ILS", quantity: 100, eventId: "mock-event" }));
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

export const updateTicketType = async (id: string, data: {
  name?: string;
  sellPriceCents?: number;
  partnerPriceCents?: number;
  currency?: string;
  quantity?: number;
}): Promise<{ id: string }> => {
  const config = getApiConfig();
  if (!config) return { id };

  return await apiFetch<{ id: string }>(`/ticket-types/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export interface TicketTypePriceVersion {
  id: string;
  ticketTypeId: string;
  currency: string;
  priceCents: number;
  startsAt: string | null;
  endsAt: string | null;
  reason: string | null;
  createdAt: string;
}

export const fetchPriceVersions = async (ticketTypeId: string): Promise<TicketTypePriceVersion[]> => {
  const config = getApiConfig();
  if (!config) return [];

  return await apiFetch<TicketTypePriceVersion[]>(`/ticket-types/${encodeURIComponent(ticketTypeId)}/price-versions?skip=0&take=100`);
};

export const createPriceVersion = async (ticketTypeId: string, data: {
  currency: string;
  priceCents: number;
  startsAt?: string;
  endsAt?: string;
  reason?: string;
}): Promise<TicketTypePriceVersion> => {
  const config = getApiConfig();
  if (!config) throw new Error("API not configured");

  return await apiFetch<TicketTypePriceVersion>(`/ticket-types/${encodeURIComponent(ticketTypeId)}/price-versions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};