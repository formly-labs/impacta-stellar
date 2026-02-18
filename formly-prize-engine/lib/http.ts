import { ApiError } from "./errors";

export function newRequestId(): string {
  return crypto.randomUUID();
}

export function jsonOk(
  data: unknown,
  status: number,
  _requestId: string
): Response {
  return Response.json(
    typeof data === "object" && data !== null ? data : { data },
    { status }
  );
}

export function jsonError(
  payload: {
    errorCode: string;
    message: string;
    details: Record<string, unknown> | null;
  },
  status: number,
  requestId: string
): Response {
  return Response.json(
    {
      errorCode: payload.errorCode,
      message: payload.message,
      details: payload.details,
      requestId,
    },
    { status }
  );
}

export async function parseJson<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Invalid JSON body",
      null
    );
  }
}
