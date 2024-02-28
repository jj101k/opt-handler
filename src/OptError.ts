import { OptExit } from "./OptExit"

/**
 *
 */
export class OptError extends OptExit {
    /**
     *
     * @param message
     * @param exitCode
     */
    constructor(message: string, readonly exitCode: number) {
        super(message)
    }
}