import { apiFetch, getApiConfig } from "./apiClient";

export interface ScanLog {
  id: string;
  ticketId: string;
  scannedAt: string;
  result: string;
  gateId: string | null;
  ticket: {
    code: string;
    attendeeName: string | null;
    event: {
      translations: { name: string }[];
    };
  };
  scannedBy: {
    name: string | null;
    email: string;
  } | null;
  gate: {
    name: string;
  } | null;
}

export const fetchScanLogs = async (params: {
  eventId?: string;
  gateId?: string;
  skip?: number;
  take?: number;
} = {}): Promise<ScanLog[]> => {
  const config = getApiConfig();
  if (!config) return [];

  const query = new URLSearchParams();
  if (params.eventId) query.append("eventId", params.eventId);
  if (params.gateId) query.append("gateId", params.gateId);
  if (params.skip !== undefined) query.append("skip", params.skip.toString());
  if (params.take !== undefined) query.append("take", params.take.toString());

  try {
    return await apiFetch<ScanLog[]>(`/scan/logs?${query.toString()}`);
  } catch (error) {
    console.warn("Failed to fetch scan logs", error);
    return [];
  }
};
