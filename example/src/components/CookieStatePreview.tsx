"use client";

import { useCookieState } from "synced-storage/react";

type CountAndName = {
  count: number;
  name: string;
};

const CookieStatePreview = () => {
  const [countAndName, setCountAndName] = useCookieState<CountAndName>(
    "countAndName",
    { count: 0, name: "John" }
  );

  return (
    <div className="space-y-4">
      <h1>Cookie State Preview</h1>
      <div>
        <button className="border p-1" onClick={handleIncrementCount}>
          Increment
        </button>
        <p>Count: {countAndName.count}</p>
        <p>Name: {countAndName.name}</p>
      </div>
    </div>
  );

  function handleIncrementCount() {
    setCountAndName((prev) => ({ ...prev, count: prev.count + 1 }));
  }
};

export default CookieStatePreview;
