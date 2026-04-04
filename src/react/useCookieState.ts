"use client";

import { useCallback, useContext, useLayoutEffect, useState } from "react";
import { SyncedStorageContext } from "@/react/SyncedStorageProvider";
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

  useLayoutEffect(() => {
    _setState(store.getItem());

    return store.subscribe((value) => {
      _setState(value);
    });
  }, [store]);

  return [state, setState] as const;
}
