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

function messageFromUnknown(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err != null && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (o.error != null && typeof o.error === "object" && typeof (o.error as Record<string, unknown>).message === "string") {
      return (o.error as Record<string, unknown>).message as string;
    }
  }
  return "An unexpected error occurred";
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const message = messageFromUnknown(err);
  return new ApiError(500, "INTERNAL_ERROR", message, undefined);
}
