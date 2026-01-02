import { apiFetch, getApiConfig } from "./apiClient";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    createdAt: string;
  };
}

export const fetchMembers = async (): Promise<OrganizationMember[]> => {
  const config = getApiConfig();
  if (!config) {
    // Mock fallback
    return [
      {
        id: "mem-1",
        organizationId: "org-1",
        userId: "user-1",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        user: {
          id: "user-1",
          email: "admin@palticket.com",
          name: "Admin User",
          phone: "0599000000",
          createdAt: new Date().toISOString(),
        },
      },
      {
        id: "mem-2",
        organizationId: "org-1",
        userId: "user-2",
        role: "STAFF",
        createdAt: new Date().toISOString(),
        user: {
          id: "user-2",
          email: "staff@palticket.com",
          name: "Staff User",
          phone: "0599111111",
          createdAt: new Date().toISOString(),
        },
      },
    ];
  }

  try {
    return await apiFetch<OrganizationMember[]>("/members?skip=0&take=100");
  } catch (error) {
    console.warn("Failed to fetch members, falling back to mock", error);
    return [];
  }
};

export const inviteMember = async (email: string, role: "ADMIN" | "STAFF"): Promise<OrganizationMember> => {
  const config = getApiConfig();
  if (!config) {
    throw new Error("API not configured");
  }

  return await apiFetch<OrganizationMember>("/members/invite", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
};

export const updateMemberRole = async (id: string, role: "ADMIN" | "STAFF"): Promise<OrganizationMember> => {
  const config = getApiConfig();
  if (!config) {
    throw new Error("API not configured");
  }

  return await apiFetch<OrganizationMember>(`/members/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
};

export const removeMember = async (id: string): Promise<void> => {
  const config = getApiConfig();
  if (!config) {
    throw new Error("API not configured");
  }

  await apiFetch<void>(`/members/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
