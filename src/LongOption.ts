import { NamedCommandLineArgument } from "./NamedCommandLineArgument"

/**
 *
 */
export class LongOption extends NamedCommandLineArgument {
    /**
     *
     * @param name Without the --, eg "help"
     * @param value If supplied in the same component.
     * @param literalArgument
     */
    constructor(public readonly name: string, public readonly value: string | undefined, literalArgument: string) {
        super(`--${name}`, literalArgument)
    }
}
