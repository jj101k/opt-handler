import { TypeHintExplicit, TypeHintImplicit } from "./TypeHint"

/**
 *
 */
export class OptWrapper<T = any> {
    /**
     *
     */
    public readonly many: boolean = false

    /**
     * This is mistyped for convenience
     */
    get initialValue(): T {
        return this.def as T
    }

    /**
     *
     * @param alias
     * @param type
     * @param required
     * @param def
     */
    constructor(public readonly alias: string[], public readonly type: TypeHintExplicit | TypeHintImplicit, public readonly required: boolean, public readonly def?: T) {
    }
}