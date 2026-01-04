import { apiFetch, getApiConfig, apiFetchPublic, getApiAuthConfig } from "./apiClient";

export type OrganizationRole = "ORG_ADMIN" | "EVENT_MANAGER" | "SELLER" | "SCANNER" | "FINANCE";

export const ROLE_LABELS: Record<OrganizationRole, string> = {
  ORG_ADMIN: "Admin",
  EVENT_MANAGER: "Event Manager",
  SELLER: "Seller",
  SCANNER: "Scanner",
  FINANCE: "Finance",
};

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    createdAt: string;
  };
}

export interface OrganizationInvite {
  id: string;
  email: string;
  role: OrganizationRole;
  token: string;
  expiresAt: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
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
        role: "ORG_ADMIN",
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
        role: "SELLER",
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

export const createInvite = async (email: string, role: OrganizationRole): Promise<OrganizationInvite> => {
  const config = getApiConfig();
  if (!config) {
    throw new Error("API not configured");
  }

  return await apiFetch<OrganizationInvite>("/members/invites", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
};

export const acceptInvite = async (token: string): Promise<{ id: string, organization: { name: string } }> => {
  const config = getApiAuthConfig();
  if (!config) {
    throw new Error("API authentication not configured");
  }

  return await apiFetchPublic<{ id: string, organization: { name: string } }>("/members/invites/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
};

export const updateMemberRole = async (id: string, role: OrganizationRole): Promise<OrganizationMember> => {
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
