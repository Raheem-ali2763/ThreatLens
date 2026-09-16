const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8001";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("threatlens_token");

  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export { API_BASE };
