import { copy } from "@/lib/copy/ar";

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Map API / network errors to Arabic UI messages — never show raw codes. */
export function mapApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "UNAUTHORIZED":
        return copy.wrongLogin;
      case "FORBIDDEN_ORIGIN":
        return copy.connectionFailed;
      case "SLUG_TAKEN":
        return copy.slugTaken;
      case "MEDIA_IN_USE":
        return copy.mediaInUse;
      case "MEDIA_NOT_FOUND":
        return copy.mediaNotFound;
      case "REVALIDATE_FAILED":
        return copy.updateWebsiteFailure;
      default:
        if (error.status === 401) return copy.wrongLogin;
        if (error.status === 502 || error.status === 503) {
          return copy.updateWebsiteFailure;
        }
        if (error.status === 0 || error.status >= 500) {
          return copy.connectionFailed;
        }
        return copy.saveFailed;
    }
  }

  if (error instanceof TypeError) {
    return copy.connectionFailed;
  }

  return copy.saveFailed;
}

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return copy.wrongLogin;
  }
  return mapApiError(error);
}
