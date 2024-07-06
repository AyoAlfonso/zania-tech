import { useEffect } from "react";

export function usePassiveEventListeners() {
  useEffect(() => {
    const options = { passive: true };
    const updateTouchEventListeners = () => {
      document.addEventListener("touchmove", () => {}, options);
    };

    updateTouchEventListeners();

    return () => {
      document.removeEventListener("touchmove", () => {}, options);
    };
  }, []);
}
