import { CommandLineArgument } from "./CommandLineArgument"

/**
 *
 */
export abstract class NamedCommandLineArgument extends CommandLineArgument {
    /**
     *
     * @param key The name of the argument as it would appear on the command line, eg. "--help"
     * @param literalArgument
     */
    constructor(public readonly key: string, literalArgument: string) {
        super(literalArgument)
    }
}