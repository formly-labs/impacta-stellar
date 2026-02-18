export interface CursorPayload {
  createdAt: string;
  id: string;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "createdAt" in parsed &&
      "id" in parsed &&
      typeof (parsed as CursorPayload).createdAt === "string" &&
      typeof (parsed as CursorPayload).id === "string"
    ) {
      return parsed as CursorPayload;
    }
    return null;
  } catch {
    return null;
  }
}
