import { OptWrapper } from "./OptWrapper"

/**
 *
 */
export type OptValues<O extends Record<string, OptWrapper>, P extends Record<string, OptWrapper>> = {
    [k in keyof O]: O[k]["initialValue"]
} & {
        [k in keyof P]: P[k]["initialValue"]
    }
