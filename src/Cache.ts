type KeyHandler<K> = (k: K) => string;

export class Cache<K, V> {
  private readonly cache = new Map<string, { value: V; expires: number }>();
  private readonly keyHandler: KeyHandler<K>;

  constructor(keyHandler?: KeyHandler<K>) {
    this.keyHandler = keyHandler || ((k) => JSON.stringify(k));
  }

  clearDeadCache() {
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (v.expires > now) continue;
      this.cache.delete(k);
    }
  }

  get(key: K) {
    const k = this.keyHandler(key);
    const v = this.cache.get(k);
    if (!v) return null;
    const now = Date.now();
    if (now > v.expires) {
      this.cache.delete(k);
      return null;
    }
    return v.value;
  }

  set(key: K, value: V, { timeout = 5 * 1000 }: { timeout?: number } = {}) {
    this.cache.set(this.keyHandler(key), { value, expires: timeout + Date.now() });
    this.clearDeadCache();
  }

  has(key: K): boolean {
    return this.get(key) !== null;
  }
}
