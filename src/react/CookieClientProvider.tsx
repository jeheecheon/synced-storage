"use client";

import { CookieClient } from "@/core";
import { type Nullable } from "@/types/misc";
import { createContext, useMemo, type FC, type PropsWithChildren } from "react";

type CookieClientState = {
  client: CookieClient;
};

export const CookieClientContext =
  createContext<Nullable<CookieClientState>>(null);

type Props = {
  ssrCookies: CookieListItem[];
};

export const CookieClientProvider: FC<PropsWithChildren<Props>> = ({
  ssrCookies,
  children,
}) => {
  const client = useMemo(() => {
    return new CookieClient(ssrCookies);
  }, [ssrCookies]);

  return (
    <CookieClientContext value={{ client }}>{children}</CookieClientContext>
  );
};
