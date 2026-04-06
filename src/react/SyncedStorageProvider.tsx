"use client";

import { CookieClient } from "@/core/CookieClient";
import { StorageClient } from "@/core/StorageClient";
import { type CookieItem } from "@/core/types";
import { type Nullable } from "@/types/misc";
import { createContext, useMemo, type FC, type PropsWithChildren } from "react";

type SyncedStorageState = {
  cookieClient: CookieClient;
  storageClient: StorageClient;
};

export const SyncedStorageContext =
  createContext<Nullable<SyncedStorageState>>(null);

type Props = {
  ssrCookies?: CookieItem[];
};

/**
 * Context provider that instantiates and shares `CookieClient` and `StorageClient`.
 *
 * Wrap your app (or subtree) with this provider so that `useCookieState` and
 * `useStorageState` can access the shared store cache.
 *
 * @param ssrCookies - Optional array of cookies from the server (e.g. `cookies().getAll()` in Next.js).
 */
export const SyncedStorageProvider: FC<PropsWithChildren<Props>> = ({
  ssrCookies,
  children,
}) => {
  const client = useMemo(() => {
    return {
      cookie: new CookieClient(ssrCookies),
      storage: new StorageClient(),
    };
  }, [ssrCookies]);

  return (
    <SyncedStorageContext.Provider
      value={{
        cookieClient: client.cookie,
        storageClient: client.storage,
      }}
    >
      {children}
    </SyncedStorageContext.Provider>
  );
};
