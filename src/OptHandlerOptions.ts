import { OptWrapper } from "./OptWrapper"

/**
 *
 */
export interface OptHandlerOptions<O extends Record<string, OptWrapper>, P extends Record<string, OptWrapper>> {
    /**
     * The options to use. This will automatically translate keys like fooBar to
     * --foo-bar, as well as fooBARBaz to --foo-bar-baz
     */
    options: O
    /**
     * The positional arguments, in the order they appear. This broadly follows
     * the convention of method arguments, which means fixed-count (required,
     * single) arguments first, then 0-1 count (optional, single) then a
     * possible single final 0+ count (optional, multi) argument at the end.
     *
     * This does also support having a series of required single arguments
     * followed by a required multiple argument for cases where that makes sense.
     *
     * As a special accommodation to UNIX convention, this also supports having
     * a series of fixed single arguments at the end.
     */
    positional: P
    /**
     * Which of the options (if any) is the help argument.
     */
    help?: string
}
