"use client";

import { CookieClient } from "@/core/CookieClient";
import { StorageClient } from "@/core/StorageClient";
import { type Nullable } from "@/types/misc";
import { createContext, useMemo, type FC, type PropsWithChildren } from "react";

type SyncedStorageState = {
  cookieClient: CookieClient;
  storageClient: StorageClient;
};

export const SyncedStorageContext =
  createContext<Nullable<SyncedStorageState>>(null);

type Props = {
  ssrCookies?: CookieListItem[];
};

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
    <SyncedStorageContext
      value={{
        cookieClient: client.cookie,
        storageClient: client.storage,
      }}
    >
      {children}
    </SyncedStorageContext>
  );
};
