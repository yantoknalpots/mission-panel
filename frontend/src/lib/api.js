// Shared fetch helper with auto-refresh
export async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export function useAutoRefresh(fetcher, interval = 15000) {
  const { useState, useEffect, useCallback } = require("react");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetcher().then(setData).catch(console.error).finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, interval);
    return () => clearInterval(iv);
  }, [refresh, interval]);

  return { data, loading, refresh };
}
