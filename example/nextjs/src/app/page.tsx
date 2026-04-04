import CookieDemo from "@/components/CookieDemo";
import LocalStorageDemo from "@/components/LocalStorageDemo";
import SessionStorageDemo from "@/components/SessionStorageDemo";

export default function Home() {
  return (
    <main className="max-w-lg mx-auto p-8 space-y-6">
      <CookieDemo />
      <LocalStorageDemo />
      <SessionStorageDemo />
    </main>
  );
}
