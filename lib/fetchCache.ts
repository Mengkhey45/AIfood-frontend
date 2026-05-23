const cache: Map<string, { ts: number; data: any }> = new Map();
const TTL = 1000 * 60 * 5; // 5 minutes

export async function fetchWithCache(url: string, opts: RequestInit = {}) {
  const key = url + JSON.stringify(opts);
  const now = Date.now();

  const hit = cache.get(key);
  if (hit && now - hit.ts < TTL) {
    return { ok: true, json: async () => hit.data, fromCache: true } as const;
  }

  const res = await fetch(url, opts);
  let payload: any = null;
  try {
    payload = await res.clone().json();
  } catch (e) {
    try { payload = await res.text(); } catch {}
  }

  if (res.ok) {
    cache.set(key, { ts: now, data: payload });
  }

  return { ok: res.ok, json: async () => payload, fromCache: false } as const;
}

export function clearFetchCache(prefix?: string) {
  if (!prefix) return cache.clear();
  for (const k of Array.from(cache.keys())) if (k.startsWith(prefix)) cache.delete(k);
}
