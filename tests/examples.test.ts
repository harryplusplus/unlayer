/**
 * Examples integration tests
 *
 * Runs example files with node to verify they execute correctly.
 */

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const examplesDir = join(__dirname, '../examples')

function runExample(filename: string): { stdout: string; stderr: string } {
  const filePath = join(examplesDir, filename)

  try {
    const stdout = execSync(`node ${filePath}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return { stdout, stderr: '' }
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string }
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? err.message ?? '' }
  }
}

describe('examples/basic.ts', () => {
  it('should execute successfully', () => {
    const { stdout, stderr } = runExample('basic.ts')

    expect(stderr).toBe('')
    expect(stdout).toContain('[INFO] API URL: https://api.example.com')
    expect(stdout).toContain('[LOG] Timeout: 5000ms')
  })
})

describe('examples/dependency-injection.ts', () => {
  it('should execute successfully', () => {
    const { stdout, stderr } = runExample('dependency-injection.ts')

    expect(stderr).toBe('')
    expect(stdout).toContain('Found user:')
  })
})

describe('examples/transient-scope.ts', () => {
  it('should execute successfully', () => {
    const { stdout, stderr } = runExample('transient-scope.ts')

    expect(stderr).toBe('')
    expect(stdout).toContain('=== Singleton Scope ===')
    expect(stdout).toContain('Same instance? true')
    expect(stdout).toContain('=== Transient Scope ===')
    expect(stdout).toContain('Same instance? false')
  })
})

describe('examples/resource-disposal.ts', () => {
  it('should execute successfully', () => {
    const { stdout, stderr } = runExample('resource-disposal.ts')

    expect(stderr).toBe('')
    expect(stdout).toContain('[DB] Executing: SELECT * FROM users')
    expect(stdout).toContain('[Watcher] Watching: /src')
    expect(stdout).toContain('=== Disposing container ===')
    expect(stdout).toContain('[Cache] Clearing')
    expect(stdout).toContain('[Watcher] Stopping')
    expect(stdout).toContain('[DB] Closing')
  })
})

describe('examples/layer-composition.ts', () => {
  it('should execute successfully', () => {
    const { stdout, stderr } = runExample('layer-composition.ts')

    expect(stderr).toBe('')
    expect(stdout).toContain('=== Development Environment ===')
    expect(stdout).toContain('=== Production Environment ===')
    expect(stdout).toContain('=== Testing with Mock Database ===')
    expect(stdout).toContain('[MOCK DB]')
  })
})
