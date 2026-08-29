import { useState, useEffect } from "react";

export function useHashRoute() {
  const [route, setRoute] = useState(typeof window !== "undefined" ? window.location.hash : "");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}
