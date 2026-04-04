import type { FC } from "react";
import CookieDemo from "@/components/CookieDemo";
import LocalStorageDemo from "@/components/LocalStorageDemo";
import SessionStorageDemo from "@/components/SessionStorageDemo";

const Home: FC = () => {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            synced-storage
          </h1>
          <p className="text-zinc-500 mt-2 text-base">
            Framework-agnostic storage sync — cookies, localStorage, sessionStorage.
          </p>
        </header>

        <div className="space-y-8">
          <CookieDemo />
          <LocalStorageDemo />
          <SessionStorageDemo />
        </div>
      </div>
    </main>
  );
};

export default Home;
