export class Cache<V> {
  constructor(private readonly cache = new Map<any, { value: V; expires: number }>()) {}

  clearDeadCache() {
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (v.expires > now) continue;
      this.cache.delete(k);
    }
  }

  get(key: any) {
    const v = this.cache.get(key);
    if (!v) return null;
    const now = Date.now();
    if (now > v.expires) {
      this.cache.delete(key);
      return null;
    }
    return v.value;
  }

  set(key: any, value: V, { timeout = 5 * 1000 }: { timeout?: number } = {}) {
    this.cache.set(key, { value, expires: timeout + Date.now() });
    this.clearDeadCache();
  }

  has(key: any): boolean {
    return this.get(key) !== null;
  }
}
