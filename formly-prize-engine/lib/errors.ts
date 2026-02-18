export class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, unknown> | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function assert(
  condition: unknown,
  status: number,
  errorCode: string,
  message: string,
  details?: Record<string, unknown> | null
): asserts condition {
  if (!condition) {
    throw new ApiError(status, errorCode, message, details);
  }
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    return new ApiError(500, "INTERNAL_ERROR", err.message, undefined);
  }
  return new ApiError(
    500,
    "INTERNAL_ERROR",
    "An unexpected error occurred",
    undefined
  );
}
