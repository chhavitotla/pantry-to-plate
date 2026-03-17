import type { Recipe } from "@/types/recipe";
import type { RecommendPayload } from "@/types/api";

const LAST_RESULTS_KEY = "chefmate:last-results";
const LAST_REQUEST_KEY = "chefmate:last-request";

type StoredResults = {
  recipes: Recipe[];
  assistantResponse: string | null;
};

export function saveResultsToSession(value: StoredResults) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(LAST_RESULTS_KEY, JSON.stringify(value));
}

export function loadResultsFromSession(): StoredResults | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(LAST_RESULTS_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredResults;
  } catch {
    return null;
  }
}

export function saveRequestToSession(value: RecommendPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(value));
}

export function loadRequestFromSession(): RecommendPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(LAST_REQUEST_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RecommendPayload;
  } catch {
    return null;
  }
}
