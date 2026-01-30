import type { FC } from "react";
import CookieStatePreview from "@/components/CookieStatePreview";
import StorageStatePreview from "@/components/StorageStatePrivew";

const Home: FC = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="space-y-12 border p-4">
        <CookieStatePreview />
        <StorageStatePreview />
      </div>
    </main>
  );
};

export default Home;
