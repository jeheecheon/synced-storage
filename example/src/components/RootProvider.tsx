import { cookies } from "next/headers";
import { FC, PropsWithChildren } from "react";
import { CookieClientProvider } from "synced-storage/react";

const RootProvider: FC<PropsWithChildren> = async ({ children }) => {
  const cookieStore = await cookies();

  return (
    <CookieClientProvider ssrCookies={cookieStore.getAll()}>
      {children}
    </CookieClientProvider>
  );
};

export default RootProvider;
