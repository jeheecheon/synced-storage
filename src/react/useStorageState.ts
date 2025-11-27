"use client";

import { cache, SetStateAction, useCallback, useEffect, useState } from "react";
import { StorageStoreOption } from "@/types/client";
import { compareDeep, isFunction } from "@/utils/misc";
import { StorageClient } from "@/core/StorageClient";
import { useIsBrowser } from "./useIsBrowser";

const getClient = cache(() => new StorageClient());

export function useStorageState<TValue>(
  key: string,
  defaultValue: TValue,
  option?: StorageStoreOption
) {
  const isBrowser = useIsBrowser();
  const store = isBrowser
    ? getClient().getOrCreateStore(key, defaultValue, option)
    : undefined;

  const [state, _setState] = useState(store?.getInitialItem() ?? defaultValue);
  const setState = useCallback(
    (action: SetStateAction<TValue>) => {
      const nextState = isFunction(action) ? action(state) : action;
      store?.setItem(nextState);
      _setState(nextState);
    },
    [store, state]
  );

  useEffect(() => {
    return store?.subscribe(() => {
      const newState = store.getItem();
      if (compareDeep(newState, state)) {
        return;
      }

      _setState(newState);
    });
  }, [store, state]);

  return [state, setState] as const;
}
