import type { FC } from "react";
import CookieStatePreview from "@/components/CookieStatePreview";

const Home: FC = () => {
  return (
    <main className="max-w-2xl mx-auto">
      <CookieStatePreview />
    </main>
  );
};

export default Home;
