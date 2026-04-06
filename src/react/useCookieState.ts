"use client";

import { useCallback, useContext, useState } from "react";
import { SyncedStorageContext } from "@/react/SyncedStorageProvider";
import { useIsomorphicLayoutEffect } from "@/react/useIsomorphicLayoutEffect";
import { type CookieStoreOption } from "@/core/types";

function useCookieStore<TValue>(
  key: string,
  defaultValue: TValue,
  option?: CookieStoreOption,
) {
  const context = useContext(SyncedStorageContext);

  if (!context) {
    throw new Error(
      "useCookieState must be used within a SyncedStorageProvider",
    );
  }

  return context.cookieClient.getOrCreateStore(key, defaultValue, option);
}

/**
 * React hook that syncs component state with a browser cookie.
 *
 * @param key - Cookie name.
 * @param defaultValue - Fallback value when the cookie does not exist or cannot be parsed.
 * @param option - Cookie options forwarded to `universal-cookie` (path, domain, expires, etc.).
 * @returns A `[state, setState]` tuple, similar to `useState`.
 */
export function useCookieState<TValue>(
  key: string,
  defaultValue: TValue,
  option?: CookieStoreOption,
) {
  const store = useCookieStore(key, defaultValue, option);

  const [state, _setState] = useState(store.getInitialItem());
  const setState = useCallback(
    (action: TValue | ((prev: TValue) => TValue)) => {
      store.setItem(action);
    },
    [store],
  );

  useIsomorphicLayoutEffect(() => {
    _setState(store.getItem());

    return store.subscribe((value) => {
      _setState(value);
    });
  }, [store]);

  return [state, setState] as const;
}
