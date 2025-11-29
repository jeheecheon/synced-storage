"use client";

import { useStorageState } from "synced-storage/react";

type CountAndName = {
  count: number;
  name: string;
};

const StorageStatePreview = () => {
  const [countAndName, setCountAndName] = useStorageState<CountAndName>(
    "countAndName",
    { count: 0, name: "John" },
    {
      strategy: "localStorage",
      expires: new Date(Date.now() + 1000 * 3),
    }
  );

  return (
    <div className="space-y-4">
      <h1>Storage State Preview</h1>
      <div>
        <button onClick={handleIncrementCount}>Increment</button>
        <p>Count: {countAndName.count}</p>
        <p>Name: {countAndName.name}</p>
      </div>
    </div>
  );

  function handleIncrementCount() {
    setCountAndName((prev) => ({ ...prev, count: prev.count + 1 }));
  }
};

export default StorageStatePreview;
