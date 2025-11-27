import type { FC } from "react";
import CookieStatePreview from "@/components/CookieStatePreview";
import StorageStatePreview from "@/components/StorageStatePrivew";

const Home: FC = () => {
  return (
    <main className="max-w-2xl mx-auto">
      <CookieStatePreview />
      <StorageStatePreview />
    </main>
  );
};

export default Home;
