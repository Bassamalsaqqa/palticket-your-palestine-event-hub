import { apiFetch, getApiConfig } from "./apiClient";

export interface AdminStats {
  totalEvents: number;
  totalOrders: number;
  totalTickets: number;
  totalRevenueCents: number;
  scansToday: number;
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const config = getApiConfig();
  if (!config) {
    // Mock fallback
    return {
      totalEvents: 12,
      totalOrders: 156,
      totalTickets: 432,
      totalRevenueCents: 1250000,
      scansToday: 45,
    };
  }

  try {
    return await apiFetch<AdminStats>("/admin/stats");
  } catch (error) {
    console.warn("Failed to fetch admin stats, falling back to mock", error);
    return {
      totalEvents: 12,
      totalOrders: 156,
      totalTickets: 432,
      totalRevenueCents: 1250000,
      scansToday: 45,
    };
  }
};
