"use client";

import {
  type SetStateAction,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { type StorageStoreOption } from "@/core/types";
import { isFunction } from "@/utils/misc";
import { SyncedStorageContext } from "@/react/SyncedStorageProvider";

function useStorageStore<TValue>(
  key: string,
  defaultValue: TValue,
  option?: StorageStoreOption
) {
  const context = useContext(SyncedStorageContext);

  if (!context) {
    throw new Error(
      "useStorageState must be used within a SyncedStorageProvider"
    );
  }

  return context.storageClient.getOrCreateStore(key, defaultValue, option);
}

export function useStorageState<TValue>(
  key: string,
  defaultValue: TValue,
  option?: StorageStoreOption
) {
  const store = useStorageStore(key, defaultValue, option);

  const [state, _setState] = useState(store.getInitialItem());
  const setState = useCallback(
    (action: SetStateAction<TValue>) => {
      const prev = store.getItem();
      const next = isFunction(action) ? action(prev) : action;
      store.setItem(next);
    },
    [key]
  );

  useLayoutEffect(() => {
    _setState(store.getItem());

    return store.subscribe(() => {
      _setState(store.getItem());
    });
  }, []);

  return [state, setState] as const;
}
