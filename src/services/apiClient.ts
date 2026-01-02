type ApiConfig = {
  baseUrl: string;
  token: string;
  organizationId: string;
};

export const getLanguage = (): "en" | "ar" => {
  const saved = localStorage.getItem("palticket-language");
  return saved === "ar" ? "ar" : "en";
};

const FORCE_MOCK_KEY = "palticket-force-mock";

export const getApiConfig = (): ApiConfig | null => {
  const isForceMock = localStorage.getItem(FORCE_MOCK_KEY) === "true";
  if (isForceMock) {
    return null;
  }

  const baseUrl =
    localStorage.getItem("palticket-api-base-url") ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    "";
  const token =
    localStorage.getItem("palticket-api-token") ||
    (import.meta.env.VITE_API_TOKEN as string | undefined) ||
    "";
  const organizationId =
    localStorage.getItem("palticket-org-id") ||
    (import.meta.env.VITE_ORGANIZATION_ID as string | undefined) ||
    "";

  if (!baseUrl || !token || !organizationId) {
    return null;
  }

  return { baseUrl, token, organizationId };
};

export const getApiAuthConfig = (): { baseUrl: string; token: string } | null => {
  const isForceMock = localStorage.getItem(FORCE_MOCK_KEY) === "true";
  if (isForceMock) {
    return null;
  }

  const baseUrl =
    localStorage.getItem("palticket-api-base-url") ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    "";
  const token =
    localStorage.getItem("palticket-api-token") ||
    (import.meta.env.VITE_API_TOKEN as string | undefined) ||
    "";

  if (!baseUrl || !token) {
    return null;
  }

  return { baseUrl, token };
};

export const setApiConfig = (config: ApiConfig) => {
  localStorage.setItem("palticket-api-base-url", config.baseUrl);
  localStorage.setItem("palticket-api-token", config.token);
  localStorage.setItem("palticket-org-id", config.organizationId);
};

export const clearApiConfig = () => {
  localStorage.removeItem("palticket-api-base-url");
  localStorage.removeItem("palticket-api-token");
  localStorage.removeItem("palticket-org-id");
};

export const setForceMock = (enabled: boolean) => {
  if (enabled) {
    localStorage.setItem(FORCE_MOCK_KEY, "true");
  } else {
    localStorage.removeItem(FORCE_MOCK_KEY);
  }
};

export const getForceMock = () => {
  return localStorage.getItem(FORCE_MOCK_KEY) === "true";
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

export const apiFetchPublic = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const config = getApiAuthConfig();
  if (!config) {
    throw new Error("API authentication not configured");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${config.token}`);

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