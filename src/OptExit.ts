import { NodeProcessLike } from "./NodeProcessLike"

/**
 *
 */
export abstract class OptExit {
    abstract readonly exitCode: number

    /**
     *
     * @param message
     */
    constructor(public readonly message: string) {
        this.message = message
    }

    /**
     * Outputs the message only
     */
    output() {
        if(this.exitCode) {
            console.error(this.message)
        } else {
            console.log(this.message)
        }
    }

    /**
     * Outputs the message, then exits
     *
     * @param process
     */
    outputAndExit(process: NodeProcessLike) {
        this.output()
        process.exit(this.exitCode)
    }
}