import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// This jsdom setup leaves window.localStorage undefined (no `url` option
// configured for jsdom, so storage has no origin to attach to), which broke
// any code using the bare `localStorage` global (e.g. src/store/authStore.ts)
// even before this file existed. Provide a minimal in-memory polyfill so
// tests see real persistence without needing a jsdom config change.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() { return this.store.size }
  clear() { this.store.clear() }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null }
  removeItem(key: string) { this.store.delete(key) }
  setItem(key: string, value: string) { this.store.set(key, String(value)) }
}
const memoryStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true })
Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true })

// Cleanup after each test
afterEach(() => {
  cleanup()
})
