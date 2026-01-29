/**
 * Layer composition example
 *
 * Demonstrates:
 * - Organizing layers by domain/feature
 * - Reusing layer combinations
 * - Type composition through layer merging
 * - Overriding layers for testing
 *
 * Each merge operation composes types:
 * - Out types are combined with union (A | B)
 * - In types exclude satisfied dependencies
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Type imported for documentation purposes (shown in comments above)

// ============================================
// Domain Layer: Config
// ============================================
interface Config {
  port: number
  dbUrl: string
}

const ConfigTag = tag<Config>('Config')

// Type: Layer<Config, never>
const ConfigDev = Layer.value(ConfigTag, {
  port: 3000,
  dbUrl: 'localhost:5432',
})

// Type: Layer<Config, never>
const ConfigProd = Layer.value(ConfigTag, {
  port: 80,
  dbUrl: 'prod-db.example.com',
})

// ============================================
// Domain Layer: Database
// ============================================
interface Database {
  query(sql: string): Promise<unknown[]>
}

const DatabaseTag = tag<Database>('Database')

// Type: Layer<Database, Config>
const DatabaseLive = Layer.factory(DatabaseTag, [ConfigTag], (config) => ({
  query(sql: string) {
    console.log(`[DB] Connecting to ${config.dbUrl}`)
    console.log(`[DB] Executing: ${sql}`)
    return Promise.resolve([])
  },
}))

// ============================================
// Domain Layer: Services
// ============================================
interface Logger {
  log(message: string): void
}

interface UserService {
  findUser(id: string): Promise<unknown>
}

const LoggerTag = tag<Logger>('Logger')
const UserServiceTag = tag<UserService>('UserService')

// Type: Layer<Logger, never>
const LoggerLive = Layer.value(LoggerTag, {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  },
})

// Type: Layer<UserService, Database | Logger>
const UserServiceLive = Layer.factory(
  UserServiceTag,
  [DatabaseTag, LoggerTag],
  (db, logger) => ({
    findUser(id: string) {
      logger.log(`Finding user: ${id}`)
      return db.query(`SELECT * FROM users WHERE id = ${id}`)
    },
  }),
)

// ============================================
// Layer Composition
// ============================================

// Compose a base application layer
// Type: Layer<Database | UserService | Logger, Config>
// Note: Config is in the In type because Database requires it, but Config is NOT provided
const AppBaseLayer = Layer.merge(DatabaseLive, UserServiceLive, LoggerLive)

// Create environment-specific layers
// Type: Layer<Config | Database | UserService | Logger, never>
// Config is now provided, so all dependencies are satisfied
const DevLayer = Layer.merge(AppBaseLayer, ConfigDev)

// Type: Layer<Config | Database | UserService | Logger, never>
const ProdLayer = Layer.merge(AppBaseLayer, ConfigProd)

// ============================================
// Usage
// ============================================

console.log('=== Development Environment ===')
const devContainer = createContainer(DevLayer)
const devUserService = devContainer.get(UserServiceTag)
await devUserService.findUser('1')
await devContainer.dispose()

console.log('\n=== Production Environment ===')
const prodContainer = createContainer(ProdLayer)
const prodUserService = prodContainer.get(UserServiceTag)
await prodUserService.findUser('1')
await prodContainer.dispose()

// ============================================
// Layer Override Example (for testing)
// ============================================

console.log('\n=== Testing with Mock Database ===')

const MockDatabase = Layer.value(DatabaseTag, {
  query(sql: string) {
    console.log(`[MOCK DB] ${sql}`)
    return Promise.resolve([{ id: '1', name: 'Test User' }])
  },
})

// Merge mock with app base (allowDuplicates needed for same tag)
const TestLayer = Layer.merge([AppBaseLayer, MockDatabase], {
  allowDuplicates: true,
})

const testContainer = createContainer(TestLayer)
// Type assertion needed because allowDuplicates loses type information
const testUserService = (
  testContainer.get as <T>(tag: { name: string }) => T
)<UserService>(UserServiceTag)
await testUserService.findUser('1')
await testContainer.dispose()
