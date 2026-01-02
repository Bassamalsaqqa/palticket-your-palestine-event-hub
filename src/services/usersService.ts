import { apiFetch, getApiConfig } from "./apiClient";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: string;
}

export const updateUserProfile = async (id: string, data: { name?: string; phone?: string }): Promise<UserProfile> => {
  const config = getApiConfig();
  if (!config) {
    // Mock update: return updated data with original ID
    return {
      id,
      email: "updated@example.com",
      name: data.name || "Updated Name",
      phone: data.phone || "0000000000",
      createdAt: new Date().toISOString()
    };
  }

  return await apiFetch<UserProfile>(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
