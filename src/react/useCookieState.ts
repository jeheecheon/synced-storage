"use client";

import {
  type SetStateAction,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { SyncedStorageContext } from "@/react/SyncedStorageProvider";
import { isFunction } from "@/utils/misc";
import { type CookieStoreOption } from "@/core/types";

function useCookieStore<TValue>(
  key: string,
  defaultValue: TValue,
  option?: CookieStoreOption
) {
  const context = useContext(SyncedStorageContext);

  if (!context) {
    throw new Error(
      "useCookieState must be used within a SyncedStorageProvider"
    );
  }

  return context.cookieClient.getOrCreateStore(key, defaultValue, option);
}

export function useCookieState<TValue>(
  key: string,
  defaultValue: TValue,
  option?: CookieStoreOption
) {
  const store = useCookieStore(key, defaultValue, option);

  const [state, _setState] = useState(store.getInitialItem());
  const setState = useCallback(
    (action: SetStateAction<TValue>) => {
      const next = isFunction(action) ? action(state) : action;
      store.setItem(next);
    },
    [store, state]
  );

  useLayoutEffect(() => {
    return store.subscribe(() => {
      _setState(store.getItem());
    });
  }, []);

  return [state, setState] as const;
}
