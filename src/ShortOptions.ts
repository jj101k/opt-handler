import { NamedCommandLineArgument } from "./NamedCommandLineArgument"

/**
 * A (bundle of) short options. This would probably be used via .next, .next,
 * .next then .rest.
 */
export class ShortOptions extends NamedCommandLineArgument {
    /**
     *
     */
    private offset = 0

    /**
     * The effective key of the last argument, eg. if you parsed "-cat" after
     * the first access of .next it would be "-c"
     */
    get prevOption() {
        if(this.offset > 0) {
            return `-${this.value.substring(this.offset - 1, this.offset)}`
        } else {
            return undefined
        }
    }
    /**
     *
     */
    get rest() {
        return this.value.substring(this.offset)
    }
    /**
     *
     * @param value
     * @param literalArgument
     */
    constructor(public readonly value: string, literalArgument: string) {
        super(literalArgument, literalArgument)
    }

    /**
     * @returns The next character (after the last one consumed)
     */
    next() {
        if (this.offset >= this.value.length) {
            return undefined
        }
        const offset = this.offset++
        return this.value.substring(offset, offset + 1)
    }
}
