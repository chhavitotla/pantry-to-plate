const LOCAL_BACKEND_FALLBACK = "http://127.0.0.1:8000";

function trimSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function deriveRenderBackendUrlFromRequest(request: Request): string | null {
  try {
    const current = new URL(request.url);
    const host = current.host;

    if (!host.includes("onrender.com")) {
      return null;
    }

    // Example:
    // chefmate-frontend.onrender.com -> chefmate-backend.onrender.com
    const backendHost = host
      .replace("-frontend.", "-backend.")
      .replace("frontend.", "backend.");

    if (backendHost === host) {
      return null;
    }

    return `${current.protocol}//${backendHost}`;
  } catch {
    return null;
  }
}

export function resolveBackendBaseUrl(request: Request): string {
  const envValue = (process.env.BACKEND_API_URL ?? "").trim();
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return trimSlash(envValue || LOCAL_BACKEND_FALLBACK);
  }

  if (envValue && !/localhost|127\.0\.0\.1/i.test(envValue)) {
    return trimSlash(envValue);
  }

  const derived = deriveRenderBackendUrlFromRequest(request);
  if (derived) {
    return trimSlash(derived);
  }

  throw new Error(
    "BACKEND_API_URL is missing or invalid in production. Configure it to your deployed backend URL.",
  );
}

