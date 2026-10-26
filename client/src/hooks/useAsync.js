import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function (like an API call) and tracks loading / error / data.
 *
 *   const { data, loading, error, reload } = useAsync(() => listingService.get(id), [id]);
 *
 * - Runs again whenever a value in `deps` changes.
 * - Ignores old responses if a newer request was started (no flicker, no race bugs).
 */
export function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: undefined, loading: immediate, error: null });
  const latestCall = useRef(0);

  const run = useCallback(async () => {
    const callId = ++latestCall.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await asyncFn();
      if (callId === latestCall.current) setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      if (callId === latestCall.current) setState((s) => ({ ...s, loading: false, error }));
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run();
  }, [run, immediate]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
