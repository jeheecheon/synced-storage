"use client";

import {
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CookieClientContext } from "@/react";
import { compareDeep, isFunction } from "@/utils/misc";
import { CookieStoreOption } from "@/types";

function useCookieStore<TValue>(
  key: string,
  defaultValue: TValue,
  option?: CookieStoreOption
) {
  const context = useContext(CookieClientContext);

  if (!context) {
    throw new Error(
      "useCookieStorage must be used within a CookieClientProvider"
    );
  }

  return context.client.getOrCreateStore(key, defaultValue, option);
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
      const nextState = isFunction(action) ? action(state) : action;
      store.setItem(nextState);
      _setState(nextState);
    },
    [store, state]
  );

  useEffect(() => {
    return store.subscribe(() => {
      const newState = store.getItem();
      if (compareDeep(newState, state)) {
        return;
      }

      _setState(newState);
    });
  }, [store, state]);

  return [state, setState] as const;
}
