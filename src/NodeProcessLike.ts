/**
 *
 */
export interface NodeProcessLike {
    /**
     *
     */
    argv: string[]
    /**
     *
     * @param code
     */
    exit(code: number): void
}