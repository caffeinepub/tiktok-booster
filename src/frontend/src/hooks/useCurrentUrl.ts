import { useEffect, useState } from "react";

export function useCurrentUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  return url;
}
