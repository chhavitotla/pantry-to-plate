import { NextResponse } from "next/server";

import { resolveBackendBaseUrl } from "@/app/api/_utils/backend-url";
import { sanitizeRecommendPayload } from "@/lib/recommend-payload";
import { recommendPayloadSchema } from "@/types/api";

const backendApiKey = process.env.BACKEND_API_KEY ?? "test-key";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = sanitizeRecommendPayload(recommendPayloadSchema.parse(json));
    const backendBaseUrl = resolveBackendBaseUrl(request);

    const response = await fetch(`${backendBaseUrl}/api/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": backendApiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "ChefMate could not talk to the backend.",
      },
      { status: 500 },
    );
  }
}
