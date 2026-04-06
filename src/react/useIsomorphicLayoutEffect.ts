import { useEffect, useLayoutEffect } from "react";

export const useIsomorphicLayoutEffect =
  typeof window === "object" ? useLayoutEffect : useEffect;
