"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns true after the component has mounted on the client.
 *
 * Used to gate UI that depends on persisted (localStorage) state so we don't
 * render a different value on the server vs. the first client render.
 */
export function useHydrated() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
}
