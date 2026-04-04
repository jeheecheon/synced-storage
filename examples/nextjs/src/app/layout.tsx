import type { FC, PropsWithChildren } from "react";
import "@/styles/globals.css";
import RootProvider from "@/components/RootProvider";

const RootLayout: FC<PropsWithChildren> = async ({ children }) => {
  return (
    <html lang="en" className="bg-zinc-950">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
