import type { Tag } from './types';

/**
 * @public
 */
export class Cache<V> {
  constructor(
    protected readonly cache = new Map<any, { value: V; tag?: Tag; expires: number }>(),
    protected readonly tagMap = new Map<Tag, Set<string>>(),
  ) {}

  clearDeadCache() {
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (v.expires > now) continue;
      this.delete(k);
    }
  }

  get(key: any) {
    const v = this.cache.get(key);
    if (!v) return null;
    const now = Date.now();
    if (now > v.expires) {
      this.delete(key);
      return null;
    }
    return v.value;
  }

  set(key: any, value: V, { timeout = 5 * 1000, tag }: { timeout?: number; tag?: Tag } = {}) {
    if (tag) {
      if (!this.tagMap.has(tag)) this.tagMap.set(tag, new Set());
      (this.tagMap.get(tag) as Set<string>).add(key);
    }
    this.cache.set(key, { value, tag, expires: timeout + Date.now() });
    this.clearDeadCache();
  }

  delete(key: any) {
    const value = this.cache.get(key);
    this.cache.delete(key);
    if (value?.tag) {
      const tagSet = this.tagMap.get(value.tag);
      if (tagSet) {
        tagSet.delete(key);
        // 如果有空的set就清理掉这个tag
        if (!tagSet.size) this.tagMap.delete(value.tag);
      }
    }
  }

  deleteByTag(tag: Tag) {
    const keys = this.tagMap.get(tag);
    keys?.forEach((key) => {
      this.cache.delete(key);
    });
    this.tagMap.delete(tag);
  }

  clear() {
    this.cache.clear();
  }

  has(key: any): boolean {
    return this.get(key) !== null;
  }
}
