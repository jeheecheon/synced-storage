"use client";

import { useCallback, useContext, useState } from "react";
import { type StorageStoreOption } from "@/core/types";
import { SyncedStorageContext } from "@/react/SyncedStorageProvider";
import { useIsomorphicLayoutEffect } from "@/react/useIsomorphicLayoutEffect";

function useStorageStore<TValue>(
  key: string,
  defaultValue: TValue,
  option?: StorageStoreOption,
) {
  const context = useContext(SyncedStorageContext);

  if (!context) {
    throw new Error(
      "useStorageState must be used within a SyncedStorageProvider",
    );
  }

  return context.storageClient.getOrCreateStore(key, defaultValue, option);
}

/**
 * React hook that syncs component state with `localStorage` or `sessionStorage`.
 *
 * @param key - Storage key.
 * @param defaultValue - Fallback value when the key does not exist or cannot be parsed.
 * @param option - Storage options (`strategy`, optional `expires`).
 * @returns A `[state, setState]` tuple, similar to `useState`.
 */
export function useStorageState<TValue>(
  key: string,
  defaultValue: TValue,
  option?: StorageStoreOption,
) {
  const store = useStorageStore(key, defaultValue, option);

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
