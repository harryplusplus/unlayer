/**
 * Any - Use this instead of `any` to avoid ESLint errors
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

/**
 * Extract types from a tuple of Tags
 */
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
 * Convert a tuple type to a union type
 */
export type TupleToUnion<T extends unknown[]> = T[number]

/**
 * Convert a Tag array to a union of wrapped types
 */
export type TagsToUnion<T extends readonly Tag<Any>[]> = TupleToUnion<
  ExtractTypes<T>
>

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
 * Extract the Out type from a Layer
 */
export type GetOut<L> = L extends {
  readonly _Out: infer Out
  readonly _In: unknown
}
  ? Out
  : never

/**
 * Extract the In type from a Layer
 */
export type GetIn<L> = L extends {
  readonly _Out: unknown
  readonly _In: infer In
}
  ? In
  : never

/**
 * Merge Out types from multiple layers
 */
export type MergeOut<
  Layers extends readonly { readonly _Out: unknown; readonly _In: unknown }[],
> = Layers extends readonly [infer First, ...infer Rest]
  ? First extends { readonly _Out: infer Out; readonly _In: unknown }
    ? Rest extends readonly { readonly _Out: unknown; readonly _In: unknown }[]
      ? Out | MergeOut<Rest>
      : Out
    : never
  : never

/**
 * Merge In types from multiple layers, excluding those provided as Out
 */
export type MergeIn<
  Layers extends readonly { readonly _Out: unknown; readonly _In: unknown }[],
> = Layers extends readonly [infer First, ...infer Rest]
  ? First extends { readonly _Out: unknown; readonly _In: infer In }
    ? Rest extends readonly { readonly _Out: unknown; readonly _In: unknown }[]
      ? Exclude<In | MergeIn<Rest>, MergeOut<Layers>>
      : In
    : never
  : never

/**
 * Container<Services> - Type-safe container
 * @param Services - Union of services this container provides
 */
export interface Container<Services = never> {
  /**
   * Get a service instance by tag
   * Only accepts tags for services that are in the Services union
   */
  get<T extends Services>(tag: Tag<T>): T

  /**
   * Dispose all resources
   */
  dispose(): Promise<void>

  /** Brand property */
  readonly _container: true
}
