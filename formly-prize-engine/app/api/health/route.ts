import { NextResponse } from "next/server";

const SERVICE_NAME = "formly-prize-engine";

/**
 * Health endpoint for load balancers and monitoring (polling).
 * GET /api/health → 200 + JSON when the service is up.
 */
export async function GET() {
  const payload = {
    status: "ok",
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status: 200 });
}
