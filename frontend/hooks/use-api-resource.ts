"use client";

import { startTransition, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/error";

export function useApiResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function readResource() {
      try {
        const nextData = await loader();

        if (isCancelled) {
          return;
        }

        setError(null);
        startTransition(() => {
          setData(nextData);
        });
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setError(getApiErrorMessage(loadError, "Something went wrong while loading data."));
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void readResource();

    return () => {
      isCancelled = true;
    };
  }, [loader, reloadKey]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setReloadKey((current) => current + 1);
    },
  };
}
