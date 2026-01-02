import { Gate } from "@/types/domain";
import { apiFetch, getApiConfig } from "./apiClient";

const mockGates: Gate[] = [
  { id: "1", name: "Main Entrance", eventId: "1", status: "active" },
  { id: "2", name: "VIP Entrance", eventId: "1", status: "active" },
  { id: "3", name: "Gate A", eventId: "2", status: "inactive" },
  { id: "4", name: "Gate B", eventId: "2", status: "inactive" },
];

type ApiGate = {
  id: string;
  name: string;
  eventId: string;
};

export const fetchAllGates = async (): Promise<Gate[]> => {
  const config = getApiConfig();
  if (!config) return mockGates;

  try {
    const gates = await apiFetch<ApiGate[]>("/gates?skip=0&take=100");
    return gates.map(g => ({
      id: g.id,
      name: g.name,
      eventId: g.eventId,
      status: "active", // Backend currently doesn't expose status in the simple select
    }));
  } catch {
    return mockGates;
  }
};

export const deleteGate = async (id: string): Promise<void> => {
  const config = getApiConfig();
  if (!config) return;
  await apiFetch(`/gates/${encodeURIComponent(id)}`, { method: "DELETE" });
};

export const createGate = async (data: {
  eventId: string;
  name: string;
}): Promise<{ id: string }> => {
  const config = getApiConfig();
  if (!config) return { id: `mock-${Date.now()}` };

  return await apiFetch<{ id: string }>("/gates", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateGate = async (id: string, data: {
  name?: string;
  eventId?: string;
}): Promise<{ id: string }> => {
  const config = getApiConfig();
  if (!config) return { id };

  return await apiFetch<{ id: string }>(`/gates/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export type ScanResponse = {
  result: "GRANTED" | "DENIED_ALREADY_USED" | "DENIED_INVALID_EVENT" | "DENIED_INVALID_TICKET";
  message: string;
  ticket?: {
    id: string;
    code: string;
    attendeeName: string | null;
  };
};

export const scanTicket = async (ticketCode: string, gateId: string, eventId?: string): Promise<ScanResponse> => {
  const config = getApiConfig();
  if (!config) {
    // Fake logic for mock
    const results: ScanResponse["result"][] = ["GRANTED", "DENIED_INVALID_TICKET"];
    const result = results[Math.floor(Math.random() * results.length)];
    return {
      result,
      message: result === "GRANTED" ? "Access Granted" : "Invalid Ticket",
      ticket: {
        id: "mock-tkt",
        code: ticketCode,
        attendeeName: "Mock Attendee",
      }
    };
  }

  return await apiFetch<ScanResponse>("/scan", {
    method: "POST",
    body: JSON.stringify({ ticketCode, gateId, eventId }),
  });
};