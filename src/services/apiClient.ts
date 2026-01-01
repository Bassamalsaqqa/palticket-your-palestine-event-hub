type ApiConfig = {
  baseUrl: string;
  token: string;
  organizationId: string;
};

export const getLanguage = (): "en" | "ar" => {
  const saved = localStorage.getItem("palticket-language");
  return saved === "ar" ? "ar" : "en";
};

export const getApiConfig = (): ApiConfig | null => {
  const baseUrl =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    localStorage.getItem("palticket-api-base-url") ||
    "";
  const token =
    (import.meta.env.VITE_API_TOKEN as string | undefined) ||
    localStorage.getItem("palticket-api-token") ||
    "";
  const organizationId =
    (import.meta.env.VITE_ORGANIZATION_ID as string | undefined) ||
    localStorage.getItem("palticket-org-id") ||
    "";

  if (!baseUrl || !token || !organizationId) {
    return null;
  }

  return { baseUrl, token, organizationId };
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const config = getApiConfig();
  if (!config) {
    throw new Error("API not configured");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${config.token}`);
  headers.set("x-organization-id", config.organizationId);

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};
