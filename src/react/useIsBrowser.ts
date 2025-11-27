import { isBrowser } from "@/utils/misc";
import { useLayoutEffect, useState } from "react";

export function useIsBrowser() {
  const [state, setState] = useState(isBrowser());

  useLayoutEffect(() => {
    setState(isBrowser());
  }, []);

  return state;
}
