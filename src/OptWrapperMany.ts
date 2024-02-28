import { OptWrapper } from "./OptWrapper"
import { TypeHintExplicit } from "./TypeHint"

/**
 *
 */
export class OptWrapperMany<T> extends OptWrapper<T[]> {
    public readonly many = true

    get initialValue(): T[] {
        return []
    }

    /**
     *
     * @param alias
     * @param type
     * @param required
     */
    constructor(public readonly alias: string[], public readonly type: TypeHintExplicit, public readonly required: boolean) {
        super(alias, type, required)
    }
}