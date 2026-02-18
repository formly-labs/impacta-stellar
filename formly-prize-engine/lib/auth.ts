import { env } from "./env";
import { ApiError } from "./errors";

export function requireServiceAuth(request: Request): void {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing or invalid Authorization header", null);
  }
  const token = auth.slice(7);
  if (token !== env.SERVICE_TOKEN) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid token", null);
  }
}
