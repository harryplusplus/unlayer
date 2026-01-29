import type {
  Any,
  ExtractTypes,
  LayerOptions,
  MergeIn,
  MergeOptions,
  MergeOut,
  Tag,
  TagsToUnion,
} from './types.ts'

/**
 * Layer<Out, In> - Layer with type parameters
 * @param Out - Services this layer provides
 * @param In - Services this layer requires
 */
export interface Layer<Out = never, In = never> {
  readonly _layer: true
  readonly _Out: Out
  readonly _In: In
}

class LayerImpl<Out = never, In = never> implements Layer<Out, In> {
  readonly _layer = true
  readonly _Out!: Out
  readonly _In!: In
  type: 'value' | 'factory' | 'merged'
  tag: Tag<unknown> | undefined
  value: unknown
  dependencies: readonly Tag<unknown>[]
  factory: ((...deps: unknown[]) => unknown) | undefined
  options: LayerOptions<unknown> | undefined
  layers: LayerImpl[] | undefined
  mergeOptions: MergeOptions | undefined

  constructor(
    type: 'value' | 'factory' | 'merged',
    tag: Tag<unknown> | undefined,
    value: unknown,
    dependencies: readonly Tag<unknown>[],
    factory: ((...deps: unknown[]) => unknown) | undefined,
    options: LayerOptions<unknown> | undefined,
    layers: LayerImpl[] | undefined,
    mergeOptions: MergeOptions | undefined,
  ) {
    this.type = type
    this.tag = tag
    this.value = value
    this.dependencies = dependencies
    this.factory = factory
    this.options = options
    this.layers = layers
    this.mergeOptions = mergeOptions
  }

  isMerged(): this is LayerImpl & { layers: LayerImpl[] } {
    return this.type === 'merged'
  }

  isValue(): this is LayerImpl & { tag: Tag<unknown>; value: unknown } {
    return this.type === 'value'
  }

  isFactory(): this is LayerImpl & {
    tag: Tag<unknown>
    dependencies: readonly Tag<unknown>[]
    factory: (...deps: unknown[]) => unknown
  } {
    return this.type === 'factory'
  }
}

function toLayerImpl<Out, In>(layer: Layer<Out, In>): LayerImpl<Out, In> {
  return layer as unknown as LayerImpl<Out, In>
}

/**
 * Create a layer with a pre-built value
 */
export function value<T>(tag: Tag<T>, value: T): Layer<T, never> {
  return new LayerImpl<T, never>(
    'value',
    tag,
    value,
    [],
    undefined,
    undefined,
    undefined,
    undefined,
  )
}

/**
 * Create a layer with a factory function (no dependencies)
 */
export function factory<T>(
  tag: Tag<T>,
  factoryFn: () => T,
  options?: LayerOptions<T>,
): Layer<T, never>

/**
 * Create a layer with a factory function (with dependencies)
 */
export function factory<T, const D extends readonly Tag<Any>[]>(
  tag: Tag<T>,
  dependencies: D,
  factoryFn: (...deps: ExtractTypes<D>) => T,
  options?: LayerOptions<T>,
): Layer<T, TagsToUnion<D>>

export function factory<T>(
  tag: Tag<T>,
  dependenciesOrFactory: Tag<unknown>[] | (() => T),
  factoryOrOptions?: ((...deps: unknown[]) => T) | LayerOptions<T>,
  options?: LayerOptions<T>,
) {
  if (typeof dependenciesOrFactory === 'function') {
    const factory = dependenciesOrFactory as () => T
    const opts = (factoryOrOptions as LayerOptions<T> | undefined) ?? options
    return new LayerImpl<T, never>(
      'factory',
      tag,
      undefined,
      [],
      factory,
      opts as LayerOptions<unknown>,
      undefined,
      undefined,
    )
  }

  const dependencies = dependenciesOrFactory
  const factory = factoryOrOptions as (...deps: unknown[]) => T
  return new LayerImpl<T, never>(
    'factory',
    tag,
    undefined,
    dependencies,
    factory,
    options as LayerOptions<unknown>,
    undefined,
    undefined,
  )
}

/**
 * Merge layers (array form - for allowDuplicates)
 */
export function merge<L extends readonly Layer<Any, Any>[]>(
  layers: L,
  options: MergeOptions,
): Layer<never, never>

/**
 * Merge layers (array form - no options)
 */
export function merge<L extends readonly Layer<Any, Any>[]>(
  layers: L,
): Layer<MergeOut<L>, MergeIn<L>>

/**
 * Merge layers (spread form - type inference)
 */
export function merge<
  L extends readonly [Layer<Any, Any>, ...Layer<Any, Any>[]],
>(...layers: L): Layer<MergeOut<L>, MergeIn<L>>

/**
 * Merge layers (spread form with options - loses type info)
 */
export function merge(
  ...layersAndOptions: [...Layer<Any, Any>[], MergeOptions]
): Layer<never, never>

/**
 * Merge layers fallback
 */
export function merge(...args: unknown[]): Layer<never, never>

export function merge(...args: unknown[]): Layer {
  const firstArg = args[0]

  if (Array.isArray(firstArg)) {
    const layers = firstArg as Layer[]
    const options = args[1] as MergeOptions | undefined
    const impls = layers.map(toLayerImpl)
    return new LayerImpl(
      'merged',
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      impls,
      options,
    )
  }

  const layers: Layer[] = []

  for (const arg of args) {
    if (
      typeof arg === 'object' &&
      arg !== null &&
      !('type' in arg) &&
      'allowDuplicates' in arg
    ) {
      return new LayerImpl(
        'merged',
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        layers.map(toLayerImpl),
        arg as MergeOptions,
      )
    }
    layers.push(arg as Layer)
  }

  const impls = layers.map(toLayerImpl)
  return new LayerImpl(
    'merged',
    undefined,
    undefined,
    [],
    undefined,
    undefined,
    impls,
    undefined,
  )
}

/**
 * Layer namespace for creating and merging layers
 */
export const Layer = { value, factory, merge }

/**
 * Get the internal LayerImpl from a Layer
 */
export function getLayerImpl<Out, In>(
  layer: Layer<Out, In>,
): LayerImpl<Out, In> {
  return toLayerImpl<Out, In>(layer)
}
