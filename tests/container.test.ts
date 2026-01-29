import { describe, expect, it, vi } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/index.ts'
import { tag } from '../src/tag.ts'

describe('createContainer', () => {
  describe('basic functionality', () => {
    it('should build a container from a layer', () => {
      const ConfigTag = tag<{ timeout: number }>('Config')
      const configLayer = Layer.value(ConfigTag, { timeout: 5000 })

      const container = createContainer(configLayer)
      expect(container).toBeDefined()
      expect(typeof container.get).toBe('function')
      expect(typeof container.dispose).toBe('function')
    })

    it('should resolve services from Layer.value', () => {
      const ConfigTag = tag<{ timeout: number }>('Config')
      const configLayer = Layer.value(ConfigTag, { timeout: 5000 })

      const container = createContainer(configLayer)
      const config = container.get(ConfigTag)

      expect(config).toEqual({ timeout: 5000 })
    })

    it('should resolve services from Layer.factory (no dependencies)', () => {
      const LoggerTag = tag<{ log: (message: string) => void }>('Logger')
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const loggerLayer = Layer.factory(LoggerTag, () => ({
        log: (message: string) => console.log(message),
      }))

      const container = createContainer(loggerLayer)
      const logger = container.get(LoggerTag)

      logger.log('test')
      expect(logSpy).toHaveBeenCalledWith('test')

      logSpy.mockRestore()
    })
  })
})
