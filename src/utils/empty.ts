/** Stable empty array so `data?.x ?? EMPTY` doesn't create a new reference every render. */
export const EMPTY: readonly never[] = Object.freeze([]) as readonly never[];
