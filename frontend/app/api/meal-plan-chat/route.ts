import { NextResponse } from "next/server";

import { mealPlanFollowUpPayloadSchema } from "@/types/api";

const backendBaseUrl =
  process.env.BACKEND_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "");
const backendApiKey = process.env.BACKEND_API_KEY ?? "test-key";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = mealPlanFollowUpPayloadSchema.parse(json);
    if (!backendBaseUrl) {
      throw new Error("BACKEND_API_URL is missing in production deployment.");
    }

    const response = await fetch(`${backendBaseUrl}/api/meal-plan-chat`, {
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
