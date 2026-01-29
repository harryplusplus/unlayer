/**
 * Basic usage example
 *
 * Demonstrates:
 * - Creating type-safe service tags
 * - Registering services with Layer.value
 * - Creating a container and resolving services
 */

import { createContainer, Layer, tag } from '../src/index.ts'

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
const ConfigLive = Layer.value(ConfigTag, {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
})

const LoggerLive = Layer.value(LoggerTag, {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  },
  info(message: string) {
    console.log(`[INFO] ${message}`)
  },
})

// Merge layers and create container
const MainLayer = Layer.merge(ConfigLive, LoggerLive)
const container = createContainer(MainLayer)

// Resolve and use services
const config = container.get(ConfigTag)
const logger = container.get(LoggerTag)

logger.info(`API URL: ${config.apiUrl}`)
logger.log(`Timeout: ${config.timeout}ms`)

// Clean up
await container.dispose()
