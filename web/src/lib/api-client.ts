export class ApiError extends Error {
  constructor(
    message: string,
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Human-readable text combining the summary and specific validation errors. */
  get displayMessage(): string {
    return this.details.length > 0 ? this.details.join(" · ") : this.message;
  }
}

interface ErrorBody {
  success?: boolean;
  message?: string;
  errors?: string[];
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.replace("/login");
  }
  const body: unknown = await response.json().catch(() => null);
  const errorBody = (body ?? {}) as ErrorBody;

  if (!response.ok || errorBody.success === false) {
    throw new ApiError(errorBody.message ?? `HTTP ${response.status}`, errorBody.errors ?? []);
  }
  return body as T;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.displayMessage;
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan tak terduga";
}
