import { ApiError } from "@/lib/api";

/**
 * Mock mode switch.
 *
 * Three ways to end up on the local mock catalog (see `lib/mock/*`):
 *
 * 1. `NEXT_PUBLIC_USE_MOCK_CART=1` (or `true`) — force mock mode, never call the API.
 * 2. `NEXT_PUBLIC_USE_MOCK_CART=0` (or `false`) — force live mode, never fall back.
 * 3. Neither set (default) — call the API, and latch into mock mode for the rest of
 *    the session as soon as a request fails because the backend is unreachable
 *    (no server running, preview environment, offline laptop).
 *
 * Option 3 is what makes "Add to cart" testable without the Express backend:
 * the shop already renders the mock catalog, and now the cart accepts those ids too.
 */

let latchedToMock = false;

function flag(): string | undefined {
  return process.env.NEXT_PUBLIC_USE_MOCK_CART;
}

export function isMockMode(): boolean {
  const value = flag()?.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return latchedToMock;
}

export function isMockModeForced(): boolean {
  const value = flag()?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

/** Latch the session into mock mode after an unreachable-backend failure. */
export function markApiUnavailable(reason?: string): void {
  if (latchedToMock) return;
  latchedToMock = true;
  console.info(
    `[mock] Garden Fairy API unreachable (${reason ?? "no response"}) — cart now runs on the local mock catalog.`,
  );
}

/** Test helper — clears the auto-latch so a suite can start from live mode. */
export function resetMockMode(): void {
  latchedToMock = false;
}

/**
 * True when an error means "the backend is not there" rather than
 * "the backend rejected this request" (400 / 404 / 409 / 422 …).
 * Only unreachable failures should fall back to mock data.
 */
export function isUnreachableError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.status === 0 || err.status >= 502;
  }
  if (err instanceof TypeError) return true; // fetch() rejects: refused / DNS / CORS / offline
  const message = err instanceof Error ? err.message : String(err ?? "");
  return /fetch|network|econnrefused|enotfound|failed to fetch|load failed/i.test(message);
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
