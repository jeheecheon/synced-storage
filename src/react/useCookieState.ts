"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import { BaseCookieStorageOption } from "@/types/client";
import { isFunction } from "@/utils/misc";
import { CookieClientContext } from "./CookieClientProvider";

function useCookieStorage<TValue>(key: string, defaultValue: TValue) {
  const context = useContext(CookieClientContext);

  if (!context) {
    throw new Error(
      "useCookieStorage must be used within a CookieClientProvider"
    );
  }

  return context.client.getOrCreateStorage(key, defaultValue);
}

export function useCookieState<TValue>(
  key: string,
  defaultValue: TValue,
  options?: BaseCookieStorageOption
) {
  const storage = useCookieStorage(key, defaultValue);

  const state = useSyncExternalStore(
    (listener) => storage.subscribe(listener),
    () => storage.getSnapshot(),
    () => storage.getServerSnapshot()
  );
  const setState = useCallback(
    (action: SetStateAction<TValue>) => {
      const prev = storage.getSnapshot();
      const next = isFunction(action) ? action(prev) : action;
      storage.setValue(next);
    },
    [key, options]
  );

  useEffect(() => {
    // NOTE: ensure the cookie is set with provided options
    setState(state);
  }, [key, options]);

  return [state, setState] as const;
}
