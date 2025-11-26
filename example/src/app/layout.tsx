import type { FC, PropsWithChildren } from "react";
import "@/styles/globals.css";
import RootProvider from "@/components/RootProvider";

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
