"use client";

import { useCallback, useContext, useSyncExternalStore } from "react";
import { type StorageStoreOption } from "@/core/types";
import { SyncedStorageContext } from "@/react/SyncedStorageProvider";

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

  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    [store],
  );
  const getSnapshot = useCallback(() => store.getItem(), [store]);
  const getServerSnapshot = useCallback(() => store.getInitialItem(), [store]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setState = useCallback(
    (action: TValue | ((prev: TValue) => TValue)) => {
      store.setItem(action);
    },
    [store],
  );

  return [state, setState] as const;
}
