import { OptWrapper } from "./OptWrapper"

/**
 *
 */
export class Opts<O extends Record<string, OptWrapper>, P extends Record<string, OptWrapper>> {
    /**
     *
     */
    private readonly optValues: Record<keyof O, any>
    /**
     *
     */
    private readonly posValues: Record<keyof P, any>

    /**
     *
     */
    get values() {
        return {...this.optValues, ...this.posValues} as {[k in keyof O]: O[k]["initialValue"]} & {[k in keyof P]: P[k]["initialValue"]}
    }

    /**
     *
     * @param options
     * @param positional
     */
    constructor(options: O, positional: P) {
        this.optValues = Object.fromEntries(Object.entries(options).map(([k, o]) => [k, o.initialValue])) as Record<keyof O, any>
        this.posValues = Object.fromEntries(Object.entries(positional).map(([k, o]) => [k, o.initialValue])) as Record<keyof P, any>
    }

    /**
     *
     * @param name
     * @param value
     */
    addOptArg<OK extends keyof O>(name: OK, value: O[OK]["initialValue"]): void {
        const existing = this.optValues[name]
        if (Array.isArray(existing)) {
            existing.push(value)
        } else {
            this.optValues[name] = value
        }
    }

    /**
     *
     * @param name
     * @param value
     */
    addPositionArg<PK extends keyof P>(name: PK, value: P[PK]["initialValue"]): void {
        const existing = this.posValues[name]
        if (Array.isArray(existing)) {
            existing.push(value)
        } else {
            this.posValues[name] = value
        }
    }
}