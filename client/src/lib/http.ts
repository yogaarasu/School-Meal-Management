export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const parseBody = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const toRequestUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
};

export const http = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(toRequestUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const message = typeof data === "object" && data?.message ? String(data.message) : "Request failed";
    throw new HttpError(response.status, message);
  }

  return data as T;
};
