import { cookies } from "next/headers";
import type { FC, PropsWithChildren } from "react";
import { CookieClientProvider } from "use-synced-storage/react";
import "../styles/globals.css";

const RootProvider: FC<PropsWithChildren> = async ({ children }) => {
  const cookieStore = await cookies();

  return (
    <CookieClientProvider ssrCookies={cookieStore.getAll()}>
      {children}
    </CookieClientProvider>
  );
};

const RootLayout: FC<PropsWithChildren> = async ({ children }) => {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
