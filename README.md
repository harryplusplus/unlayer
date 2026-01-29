# unlayer

A type-safe dependency injection container inspired by Effect.ts Layer system.

## Features

- **Type-safe** - Fully typed service identifiers and dependencies
- **Layer-based** - Compose your application with layers
- **Scoped services** - Singleton (default) or transient scope
- **Resource disposal** - Automatic cleanup with dispose callbacks
- **Lightweight** - No dependencies

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

interface UserService {
  getUser(id: string): Promise<User | null>
}

// Create type-safe tags
const DatabaseTag = tag<Database>('Database')
const UserServiceTag = tag<UserService>('UserService')

// Define layers
const DatabaseLive = Layer.value(DatabaseTag, new Database())

const UserServiceLive = Layer.factory(
  UserServiceTag,
  [DatabaseTag], // dependencies
  (db) => ({
    async getUser(id: string) {
      return db.find(id)
    }
  })
)

// Create container and use services
const container = createContainer(
  Layer.merge(DatabaseLive, UserServiceLive)
)

const userService = container.get(UserServiceTag)
await userService.getUser('1')

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
  UserServiceLive,
)

// Array syntax
const MainLayer = Layer.merge([
  ConfigLive,
  DatabaseLive,
  UserServiceLive,
])

// With options
const MainLayer = Layer.merge(layers, {
  allowDuplicates: true,
})
```

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
