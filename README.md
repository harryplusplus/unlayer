# unlayer

A type-safe dependency injection container inspired by Effect.ts Layer system.

## Features

- **Compile-time type safety** - `container.get()` only allows services that registered in the container
- **Layer-based** - Compose your application with layers
- **Scoped services** - Singleton (default) or transient scope
- **Resource disposal** - Automatic cleanup with dispose callbacks
- **Lightweight** - No dependencies

## Type Safety

The core feature is **compile-time type safety** - you cannot use services that aren't registered in the container:

```typescript
import { tag, Layer, createContainer } from 'unlayer'

interface Database {
  find(id: string): Promise<User | null>
}

const DatabaseTag = tag<Database>('Database')
const LoggerTag = tag<{ log(msg: string): void }>('Logger')

const container = createContainer(
  Layer.value(DatabaseTag, new Database())
)

// ✅ Works - Database is in the container
const db = container.get(DatabaseTag)

// ❌ Compile-time error - Logger is NOT in the container
// const logger = container.get(LoggerTag)
// Error: Argument of type 'Tag<{ log(msg: string): void }>' is not assignable to parameter of type 'Tag<Database>'
```

## Installation

```bash
npm install unlayer
pnpm add unlayer
yarn add unlayer
```

## Quick Start

```typescript
import { tag, Layer, createContainer } from 'unlayer'

// Define service interfaces
interface Database {
  find(id: string): Promise<User | null>
}

interface Logger {
  log(msg: string): void
}

// Create type-safe tags
const DatabaseTag = tag<Database>('Database')
const LoggerTag = tag<Logger>('Logger')

// Define layers
const DatabaseLive = Layer.value(DatabaseTag, new Database())

const LoggerLive = Layer.factory(
  LoggerTag,
  [DatabaseTag], // dependencies
  (db) => ({
    log(msg: string) {
      const user = db.find('1')
      console.log(`[${msg}]`, user)
    }
  })
)

// Create container and use services
const container = createContainer(
  Layer.merge(DatabaseLive, LoggerLive)
)

const logger = container.get(LoggerTag)
logger.log('Starting application')

// Clean up
await container.dispose()
```

## Documentation

### Creating Tags

```typescript
import { tag } from 'unlayer'

const ConfigTag = tag<{ apiUrl: string; timeout: number }>('Config')
```

### Layer Types

**Value Layer** - Pre-built values:
```typescript
const ConfigLive = Layer.value(ConfigTag, {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
})
```

**Factory Layer** - Lazy initialization:
```typescript
// No dependencies
const LoggerLive = Layer.factory(LoggerTag, () => ({
  log: (message: string) => console.log(message),
}))

// With dependencies
const ServiceLive = Layer.factory(
  ServiceTag,
  [DatabaseTag, CacheTag], // dependency array
  (db, cache) => ({
    async getData(id: string) {
      const cached = cache.get(id)
      if (cached) return cached
      return db.find(id)
    }
  })
)
```

### Scope

**Singleton** (default) - Same instance every time:
```typescript
const SingletonLive = Layer.factory(ServiceTag, () => ({ /* ... */ }))
// or explicitly
const SingletonLive = Layer.factory(ServiceTag, () => ({ /* ... */ }), {
  scope: 'singleton',
})
```

**Transient** - New instance every time:
```typescript
const TransientLive = Layer.factory(ServiceTag, () => ({ /* ... */ }), {
  scope: 'transient',
})
```

### Resource Disposal

```typescript
const DatabaseLive = Layer.factory(
  DatabaseTag,
  () => ({ /* ... */ }),
  {
    dispose: async (db) => {
      await db.close()
    },
  }
)
```

### Merging Layers

```typescript
// Spread syntax
const MainLayer = Layer.merge(
  ConfigLive,
  DatabaseLive,
  LoggerLive,
)

// Array syntax
const MainLayer = Layer.merge([
  ConfigLive,
  DatabaseLive,
  LoggerLive,
])

// With options
const MainLayer = Layer.merge(layers, {
  allowDuplicates: true,
})
```

### Duplicate Tags

By default, merging layers with the same tag will throw an error. Use `allowDuplicates: true` to allow the last layer to win:

```typescript
const DatabaseTag = tag<Database>('Database')

const db1 = Layer.value(DatabaseTag, dbInstance1)
const db2 = Layer.value(DatabaseTag, dbInstance2)

// ❌ Throws: Duplicate tag detected: Database
Layer.merge(db1, db2)

// ✅ Allows duplicates - db2 wins
const MainLayer = Layer.merge(db1, db2, {
  allowDuplicates: true,
})
```

**Note:** When using `allowDuplicates`, type information is lost (`Layer<never, never>`) since duplicate tags cannot be statically tracked.

## Examples

See the [examples](https://github.com/harryplusplus/unlayer/tree/main/examples) directory for more usage patterns:

- [basic.ts](https://github.com/harryplusplus/unlayer/tree/main/examples/basic.ts) - Basic usage
- [dependency-injection.ts](https://github.com/harryplusplus/unlayer/tree/main/examples/dependency-injection.ts) - Dependency injection chains
- [transient-scope.ts](https://github.com/harryplusplus/unlayer/tree/main/examples/transient-scope.ts) - Singleton vs transient scope
- [resource-disposal.ts](https://github.com/harryplusplus/unlayer/tree/main/examples/resource-disposal.ts) - Resource cleanup
- [layer-composition.ts](https://github.com/harryplusplus/unlayer/tree/main/examples/layer-composition.ts) - Layer composition patterns

Run examples with:
```bash
node examples/basic.ts
```

## License

MIT
