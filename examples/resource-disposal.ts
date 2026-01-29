/**
 * Resource disposal example
 *
 * Demonstrates:
 * - Using dispose callbacks for cleanup
 * - Asynchronous resource cleanup
 * - Proper disposal order (reverse of creation)
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Define services with resources
interface DatabaseConnection {
  query(sql: string): Promise<unknown[]>
  close(): Promise<void>
}

interface FileSystemWatcher {
  watch(path: string): void
  stop(): Promise<void>
}

interface CacheService {
  get(key: string): unknown
  set(key: string, value: unknown): void
  clear(): Promise<void>
}

// Create tags
const DatabaseTag = tag<DatabaseConnection>('DatabaseConnection')
const WatcherTag = tag<FileSystemWatcher>('FileSystemWatcher')
const CacheTag = tag<CacheService>('CacheService')

// Database layer with dispose callback
const DatabaseLive = Layer.factory(
  DatabaseTag,
  [],
  () => {
    const connections = new Set<string>()
    return {
      query(sql: string) {
        const connectionId = `conn-${Math.random()}`
        connections.add(connectionId)
        console.log(`[DB] Executing: ${sql}`)
        return Promise.resolve([])
      },
      close() {
        console.log(`[DB] Closing ${connections.size} connection(s)`)
        connections.clear()
        return Promise.resolve(undefined)
      },
    }
  },
  {
    dispose: async (db) => {
      await db.close()
    },
  },
)

// File watcher with dispose callback
const WatcherLive = Layer.factory(
  WatcherTag,
  [],
  () => {
    const watchedPaths = new Set<string>()
    return {
      watch(path: string) {
        watchedPaths.add(path)
        console.log(`[Watcher] Watching: ${path}`)
      },
      stop() {
        console.log(`[Watcher] Stopping ${watchedPaths.size} watcher(s)`)
        watchedPaths.clear()
        return Promise.resolve(undefined)
      },
    }
  },
  {
    dispose: async (watcher) => {
      await watcher.stop()
    },
  },
)

// Cache service with dispose callback
const CacheLive = Layer.factory(
  CacheTag,
  [],
  () => {
    const store = new Map<string, unknown>()
    return {
      get(key: string) {
        return store.get(key)
      },
      set(key: string, value: unknown) {
        store.set(key, value)
      },
      clear() {
        console.log(`[Cache] Clearing ${store.size} entries`)
        store.clear()
        return Promise.resolve(undefined)
      },
    }
  },
  {
    dispose: async (cache) => {
      await cache.clear()
    },
  },
)

// Merge layers and create container
const MainLayer = Layer.merge(DatabaseLive, WatcherLive, CacheLive)
const container = createContainer(MainLayer)

// Use services
const db = container.get(DatabaseTag)
const watcher = container.get(WatcherTag)
const cache = container.get(CacheTag)

void db.query('SELECT * FROM users')
watcher.watch('/src')
cache.set('key', 'value')

console.log('\n=== Disposing container ===')

// Dispose will be called in reverse order: Cache -> Watcher -> Database
await container.dispose()
