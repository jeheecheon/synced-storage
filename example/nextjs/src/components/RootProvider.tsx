import { cookies } from "next/headers";
import { FC, PropsWithChildren } from "react";
import { SyncedStorageProvider } from "synced-storage/react";

const RootProvider: FC<PropsWithChildren> = async ({ children }) => {
  const cookieStore = await cookies();

  return (
    <SyncedStorageProvider ssrCookies={cookieStore.getAll()}>
      {children}
    </SyncedStorageProvider>
  );
};

export default RootProvider;
