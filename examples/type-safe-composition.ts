/**
 * Type-safe composition example
 *
 * Demonstrates how the Layer<Out, In> type system enables:
 * - Compile-time type tracking of provided services (Out)
 * - Compile-time type tracking of required dependencies (In)
 * - Type composition when merging layers
 * - Type-safe container with Container<Services>
 *
 * Hover over variables in your IDE to see the inferred types!
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Type imported for documentation purposes (shown in comments above)

// ============================================
// Define Services
// ============================================
interface Config {
  port: number
  dbUrl: string
}

interface Database {
  query(sql: string): Promise<unknown[]>
}

interface Cache {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

interface UserService {
  getUser(id: string): Promise<unknown>
}

const ConfigTag = tag<Config>('Config')
const DatabaseTag = tag<Database>('Database')
const CacheTag = tag<Cache>('Cache')
const UserServiceTag = tag<UserService>('UserService')

// ============================================
// Layer 1: Config (no dependencies)
// ============================================
// Type: Layer<Config, never>
// Out: Config (what this layer provides)
// In: never (what this layer requires)
const ConfigLive = Layer.value(ConfigTag, {
  port: 3000,
  dbUrl: 'localhost:5432',
})

// ============================================
// Layer 2: Database (depends on Config)
// ============================================
// Type: Layer<Database, Config>
// Out: Database (what this layer provides)
// In: Config (what this layer requires)
const DatabaseLive = Layer.factory(DatabaseTag, [ConfigTag], (config) => ({
  query(sql: string) {
    console.log(`[DB] Connecting to ${config.dbUrl}`)
    console.log(`[DB] Executing: ${sql}`)
    return Promise.resolve([])
  },
}))

// ============================================
// Layer 3: Cache (no dependencies)
// ============================================
// Type: Layer<Cache, never>
const CacheLive = Layer.value(CacheTag, {
  async get(_key: string) {
    return Promise.resolve(null)
  },
  set(key: string, value: string) {
    console.log(`[Cache] ${key} = ${value}`)
    return Promise.resolve()
  },
})

// ============================================
// Layer 4: UserService (depends on Database and Cache)
// ============================================
// Type: Layer<UserService, Database | Cache>
// Out: UserService (what this layer provides)
// In: Database | Cache (what this layer requires)
const UserServiceLive = Layer.factory(
  UserServiceTag,
  [DatabaseTag, CacheTag],
  (db, cache) => ({
    async getUser(id: string): Promise<unknown> {
      const cached = await cache.get(`user:${id}`)
      if (cached) {
        return JSON.parse(cached) as unknown
      }
      const result = await db.query(`SELECT * FROM users WHERE id = ${id}`)
      await cache.set(`user:${id}`, JSON.stringify(result))
      return result
    },
  }),
)

// ============================================
// Type Composition Example 1: Two layers
// ============================================
// Type: Layer<Config | Database, never>
// Out: Config | Database (combined from both layers)
// In: never (Config is provided by ConfigLive, so Database's dependency is satisfied)
const ConfigAndDatabase = Layer.merge(ConfigLive, DatabaseLive)

console.log('=== Example 1: Config + Database ===')
const container1 = createContainer(ConfigAndDatabase)
// container1 type: Container<Config | Database>
const config = container1.get(ConfigTag)
const db = container1.get(DatabaseTag)
console.log(`Config: port=${config.port}, dbUrl=${config.dbUrl}`)
await db.query('SELECT 1')
await container1.dispose()

// ============================================
// Type Composition Example 2: All layers
// ============================================
// Type: Layer<Config | Database | Cache | UserService, never>
// Out: All services combined
// In: never (all dependencies are satisfied within the merge)
const AppLayer = Layer.merge(
  ConfigLive,
  DatabaseLive,
  CacheLive,
  UserServiceLive,
)

console.log('\n=== Example 2: Full Application ===')
const container2 = createContainer(AppLayer)
// container2 type: Container<Config | Database | Cache | UserService>
const userService = container2.get(UserServiceTag)
await userService.getUser('123')
await container2.dispose()

// ============================================
// Type Composition Example 3: Partial merge
// ============================================
// Type: Layer<Database | UserService, Cache>
// Out: Database | UserService
// In: Cache (only Cache is required but not provided in this merge)
const PartialLayer = Layer.merge(DatabaseLive, UserServiceLive)

// To use this Layer, you must also provide Cache:
const FullAppLayer = Layer.merge(PartialLayer, CacheLive, ConfigLive)

console.log('\n=== Example 3: Partial Merge ===')
const container3 = createContainer(FullAppLayer)
const userService2 = container3.get(UserServiceTag)
await userService2.getUser('456')
await container3.dispose()

// ============================================
// Type Safety Summary
// ============================================
console.log('\n=== Type Safety Summary ===')
console.log('ConfigLive:         Layer<Config, never>')
console.log('DatabaseLive:       Layer<Database, Config>')
console.log('CacheLive:          Layer<Cache, never>')
console.log('UserServiceLive:    Layer<UserService, Database | Cache>')
console.log('')
console.log('ConfigAndDatabase:  Layer<Config | Database, never>')
console.log(
  'AppLayer:           Layer<Config | Database | Cache | UserService, never>',
)
console.log('')
console.log('container1:          Container<Config | Database>')
console.log(
  'container2:          Container<Config | Database | Cache | UserService>',
)
