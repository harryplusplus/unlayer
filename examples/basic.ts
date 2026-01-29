/**
 * Basic usage example
 *
 * Demonstrates:
 * - Creating type-safe service tags
 * - Registering services with Layer.value (returns Layer<T, never>)
 * - Creating a container with typed services
 * - Type inference with Container<Services>
 *
 * Type annotations below show what TypeScript infers at compile time.
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Types imported for documentation purposes (shown in comments above)

// Define service interfaces
interface Config {
  apiUrl: string
  timeout: number
}

interface Logger {
  log(message: string): void
  info(message: string): void
}

// Create type-safe tags
const ConfigTag = tag<Config>('Config')
const LoggerTag = tag<Logger>('Logger')

// Create layers with pre-built values
// Type: Layer<Config, never>
const ConfigLive = Layer.value(ConfigTag, {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
})

// Type: Layer<Logger, never>
const LoggerLive = Layer.value(LoggerTag, {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  },
  info(message: string) {
    console.log(`[INFO] ${message}`)
  },
})

// Merge layers and create container
// Type: Layer<Config | Logger, never>
const MainLayer = Layer.merge(ConfigLive, LoggerLive)

// Type: Container<Config | Logger>
// Hover over 'container' in IDE to see the available services
const container = createContainer(MainLayer)

// Resolve and use services
// Type: Config (inferred from container type)
const config = container.get(ConfigTag)

// Type: Logger (inferred from container type)
const logger = container.get(LoggerTag)

logger.info(`API URL: ${config.apiUrl}`)
logger.log(`Timeout: ${config.timeout}ms`)

// Clean up
await container.dispose()
