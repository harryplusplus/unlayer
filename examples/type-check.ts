/**
 * Type safety verification example
 *
 * Run: pnpm tsx examples/type-check.ts
 * Check types: pnpm tsc --noEmit examples/type-check.ts
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Define services
interface Config {
  port: number
}

interface Logger {
  log(msg: string): void
}

interface Database {
  query(): void
}

const ConfigTag = tag<Config>('Config')
const LoggerTag = tag<Logger>('Logger')
const _DatabaseTag = tag<Database>('Database')

// Create layers
const ConfigLive = Layer.value(ConfigTag, { port: 3000 })
const LoggerLive = Layer.value(LoggerTag, {
  log: (msg: string) => console.log(msg),
})

// Merged layer type: Layer & TypedLayer<Config | Logger, never>
const AppLayer = Layer.merge(ConfigLive, LoggerLive)

// Container type: TypedContainer<Config | Logger>
const container = createContainer(AppLayer)

// ✅ This works - Config is in the container
const config: Config = container.get(ConfigTag)

// ✅ This works - Logger is in the container
const logger: Logger = container.get(LoggerTag)

// ❌ This errors at compile-time - Database is NOT in the container!
// Uncomment to see the error:
// const _db = container.get(_DatabaseTag)

// Verify types at runtime
console.log('=== Type Check Example ===')
console.log(
  'config type:',
  typeof config.port === 'number' ? 'Config' : 'unknown',
)
console.log(
  'logger type:',
  typeof logger.log === 'function' ? 'Logger' : 'unknown',
)

// Show what the container type is
type _ContainerType = typeof container
// Hover over _ContainerType to see: Container<Config | Logger>

console.log(
  '\n✓ Type check passed - uncomment line 47 to see compile-time error',
)

await container.dispose()
