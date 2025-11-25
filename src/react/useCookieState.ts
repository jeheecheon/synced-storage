"use client";

import { useContext, useEffect, useState } from "react";
import { BaseCookieStorageOption } from "@/types/client";
import { CookieClientContext } from "@/react";
import { compareDeep } from "@/utils/misc";

function useCookieStorage<TValue>(
  key: string,
  defaultValue: TValue,
  option?: BaseCookieStorageOption
) {
  const context = useContext(CookieClientContext);

  if (!context) {
    throw new Error(
      "useCookieStorage must be used within a CookieClientProvider"
    );
  }

  return context.client.getOrCreateStorage(key, defaultValue, option);
}

export function useCookieState<TValue>(
  key: string,
  defaultValue: TValue,
  option?: BaseCookieStorageOption
) {
  const storage = useCookieStorage(key, defaultValue, option);

  const [state, setState] = useState(storage.getInitialValue());

  useEffect(() => {
    return storage.subscribe(() => {
      const newState = storage.getValue();
      if (compareDeep(newState, state)) {
        return;
      }

      storage.setValue(newState);
    });
  }, [state]);

  return [state, setState] as const;
}
