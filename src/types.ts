/**
 * Any
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

/**
 * Type-safe service identifier
 */
export interface Tag<T> {
  name: string
  _brand: T
}

export type ExtractTypes<T extends readonly Tag<Any>[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends Tag<infer U>
    ? Rest extends readonly Tag<Any>[]
      ? [U, ...ExtractTypes<Rest>]
      : [U]
    : never
  : []

/**
 * Service lifecycle scope
 */
export type Scope = 'singleton' | 'transient'

/**
 * Options for Layer.factory
 */
export interface LayerOptions<T> {
  /**
   * Cleanup function called when container is disposed
   */
  dispose?: (instance: T) => void | Promise<void>

  /**
   * Service lifecycle scope (default: 'singleton')
   */
  scope?: Scope
}

/**
 * Options for Layer.merge
 */
export interface MergeOptions {
  /**
   * Allow duplicate tags (default: false)
   */
  allowDuplicates?: boolean
}

/**
 * Container - resolves and manages service instances
 */
export interface Container {
  /**
   * Get a service instance by tag
   */
  get<T>(tag: Tag<T>): T

  /**
   * Dispose all resources
   */
  dispose(): Promise<void>
}
