import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/**
 * Runs `loader` on mount and whenever `deps` change (compared by value).
 * Loading is derived from whether the latest request has settled, so state is
 * only ever set from promise callbacks and stale responses are dropped.
 * Previous data stays available while a reload is in flight.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const depsKey = JSON.stringify(deps);
  const [nonce, setNonce] = useState(0);
  const requestKey = `${depsKey}#${nonce}`;
  const [settled, setSettled] = useState<Settled<T>>({ key: "", data: null, error: null });

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let alive = true;
    loaderRef.current()
      .then((data) => alive && setSettled({ key: requestKey, data, error: null }))
      .catch((err: unknown) => {
        if (!alive) return;
        const error = err instanceof Error ? err.message : String(err);
        setSettled((prev) => ({ key: requestKey, data: prev.data, error }));
      });
    return () => {
      alive = false;
    };
  }, [requestKey]);

  const loading = settled.key !== requestKey;
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setSettled((prev) => ({
      ...prev,
      data: typeof updater === "function" ? (updater as (p: T | null) => T)(prev.data) : updater,
    }));
  }, []);

  return { data: settled.data, error: loading ? null : settled.error, loading, reload, setData };
}
