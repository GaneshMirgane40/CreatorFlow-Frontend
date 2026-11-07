import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs `load()` whenever `key` changes (or `reload()` is called) and tracks the result.
 *
 * - `data` keeps the previous result while a reload is in flight, so pages don't flash.
 * - `stale` is true when `data` belongs to a different `key` (e.g. another project id).
 * - State is only set from promise callbacks, which keeps the react-hooks lint rules happy.
 */
export default function useAsync(load, key = "default") {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ requestId: null, key: null, data: undefined, error: null });
  const requestId = `${key}#${version}`;

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => loadRef.current())
      .then(
        (data) => active && setResult({ requestId, key, data, error: null }),
        (error) => active && setResult({ requestId, key, data: undefined, error })
      );

    return () => {
      active = false;
    };
  }, [requestId, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const stale = result.key !== key;

  return {
    data: stale ? undefined : result.data,
    error: stale ? null : result.error,
    loading: result.requestId !== requestId,
    initialLoading: stale,
    reload,
  };
}
