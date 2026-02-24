import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { runTick } from "@/domain/jobs/jobService";

const tickBodySchema = {
  runMode: "execute" as const,
  maxPrizes: 50,
};

function parseTickBody(bodyText: string): { runMode: "dry_run" | "execute"; maxPrizes: number } {
  if (!bodyText?.trim()) {
    return { runMode: "execute", maxPrizes: 50 };
  }
  try {
    const json = JSON.parse(bodyText) as Record<string, unknown>;
    const runMode =
      json.runMode === "dry_run" ? "dry_run" : (tickBodySchema.runMode as "dry_run" | "execute");
    const maxPrizes =
      typeof json.maxPrizes === "number" && json.maxPrizes >= 1 && json.maxPrizes <= 100
        ? json.maxPrizes
        : 50;
    return { runMode, maxPrizes };
  } catch {
    return { runMode: "execute", maxPrizes: 50 };
  }
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const bodyText = await request.text();
    const { runMode, maxPrizes } = parseTickBody(bodyText);
    const result = await runTick(requestId, { runMode, maxPrizes });
    return jsonOk(result, 200, requestId);
  } catch (err) {
    const apiErr = normalizeError(err);
    return jsonError(
      {
        errorCode: apiErr.errorCode,
        message: apiErr.message,
        details: apiErr.details ?? null,
      },
      apiErr.status,
      requestId
    );
  }
}
