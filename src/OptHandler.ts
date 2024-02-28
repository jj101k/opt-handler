import { AbortProcessingSymbol } from "./AbortProcessingSymbol"
import { LiteralArgument } from "./LiteralArgument"
import { LongOption } from "./LongOption"
import { NodeProcessLike } from "./NodeProcessLike"
import { OptError } from "./OptError"
import { OptExit } from "./OptExit"
import { OptHandlerOptions } from "./OptHandlerOptions"
import { OptHelpExit } from "./OptHelpExit"
import { OptWrapper } from "./OptWrapper"
import { Opts } from "./Opts"
import { ShortOptions } from "./ShortOptions"

/**
 *
 */
export class OptHandler<O extends Record<string, OptWrapper>, P extends Record<string, OptWrapper>> {
    /**
     *
     * @param options
     */
    public static assertValidOptions(options: OptHandlerOptions<Record<string, OptWrapper>, Record<string, OptWrapper>>): void {
        let seenVariablePositional = false
        let seenMultiPositional = false
        for (const v of Object.values(options.positional)) {
            if (seenVariablePositional && v.required) {
                throw new Error("Required positional arguments provided after optional positional arguments")
            }
            if (seenMultiPositional) {
                throw new Error("Arguments provided after spread positional arguments")
            }
            if (v.many) {
                seenMultiPositional = seenVariablePositional = true
            } else if (!v.required) {
                seenVariablePositional = true
            }
        }
    }
    /**
     *
     */
    private helpOption?: string
    /**
     *
     */
    private options: O

    /**
     *
     */
    private positional: P

    /**
     *
     * @param key
     * @param opt
     * @param getExplicitValue
     * @param value
     * @returns
     */
    private getArgValue(key: string, opt: OptWrapper, getExplicitValue: () => string | undefined, value?: string) {
        /**
         *
         * @returns
         */
        const getExplicitValueOrThrow = () => {
            const value = getExplicitValue()
            if (value === undefined) {
                throw new OptError(`Error: Option ${key} required an argument`, 7)
            }
            return value
        }
        switch (opt.type) {
            case "boolean":
                if (value !== undefined) {
                    throw new OptError(`Error: Argument supplied for boolean option ${key}`, 6)
                }
                return true
            case "number": {
                const v = value ?? getExplicitValueOrThrow()
                if (Number.isNaN(v)) {
                    throw new OptError(`Error: Argument must be numeric for ${key}`, 6)
                }
                return +v
            }
            case "string":
                return value ?? getExplicitValueOrThrow()
        }
    }

    /**
     *
     * @param key
     * @param opt
     * @param value
     * @returns
     */
    private getPositionArgValue<PK extends keyof P>(key: PK & string, opt: OptWrapper, value: string): P[PK]["initialValue"] {
        switch (opt.type) {
            case "boolean":
                if (value.match(/^(0|false)$/)) {
                    return false
                } else if (value.match(/^(1|true)$/)) {
                    return true
                } else {
                    throw new OptError(`Error: Only 0, 1, true or false are supported for boolean ${key} (${value})`, 9)
                }
            case "number": {
                if (Number.isNaN(value)) {
                    throw new OptError(`Error: Argument must be numeric for ${key}`, 6)
                }
                return +value
            }
            case "string":
                return value
        }
    }

    /**
     *
     * @param arg
     * @returns
     */
    private parseArg(arg: string) {
        let md: RegExpMatchArray | null
        if (md = arg.match(/^--([\w-]+)(=(.*))?/)) {
            // Long opt.
            const [name, value] = [md[1], md[2] ?? undefined]
            return new LongOption(name, value, arg)
        } else if (md = arg.match(/^-(\w.*)/)) {
            // Short opts.
            const shortOpts = md[1]
            return new ShortOptions(shortOpts, arg)
        } else if (arg == "--") {
            // Stop processing
            return new AbortProcessingSymbol(arg)
        } else {
            return new LiteralArgument(arg)
        }
    }

    /**
     *
     * @param k eg. "getAll", "getALL"
     * @returns eg. "--get-all"
     */
    private toCliArg(k: string): string {
        // Either a run of upper-case characters ending the string
        // Or a run of upper-case characters minus one, if that's before a
        // lower-case
        // Or a single upper-case character followed by multiple lower case.
        //
        // myDNSFiles -> --my-dns-files
        // myDNS -> --my-dns
        // myFiles -> --my-files
        // totalGForce -> --total-g-force
        //
        // Note that this does not treat "s" specially, so myTVs -> my-t-vs.
        return "--" + k.replace(/(?<=.)(\p{Lu}+$|\p{Lu}+(?=\p{Lu}[\d_\p{Ll}]*)|\p{Lu}[\d_\p{Ll}]*)/gu, (a, $1) => `-${$1.toLowerCase()}`)
    }

    /**
     *
     */
    get helpMessage() {
        const optionalise = (o: string, config: OptWrapper) => {
            if (config.required) {
                return config.many ? `${o} [${o}]...` : o
            } else {
                return config.many ? `[${o}]...` : `[${o}]`
            }
        }

        const argComponents = Object.entries(this.options).sort(([a, ac], [b, bc]) => (+!!ac.required - +!!bc.required) || a.localeCompare(b)).map(([s, config]) => {
            let o: string
            const cliArg = this.toCliArg(s)
            o = [...config.alias.map(a => `-${a}`), cliArg].join("|")
            if (config.type != "boolean") {
                if (config.def) {
                    o += ` <${config.type} = ${config.def}>`
                } else {
                    o += ` <${config.type}>`
                }
            }
            return optionalise(o, config)
        })

        const positional = Object.entries(this.positional).map(([s, config]) => optionalise(`<${s}>`, config))
        const components = [this.name, ...argComponents, ...positional]
        return `Usage: ${components.join(" ")}`
    }

    /**
     *
     * @param options
     * @param name
     */
    constructor(options: OptHandlerOptions<O, P>, private name: string) {
        OptHandler.assertValidOptions(options)
        this.helpOption = options.help
        this.options = options.options
        this.positional = options.positional
    }

    /**
     *
     * @param argv
     * @returns
     */
    fromArgv(argv: string[]) {
        return this.fromProgramArgs(argv.slice(2))
    }

    /**
     * This directly uses process.argv and process.exit to respond to --help as
     * well as invalid args.
     *
     * If you want more fine-grained control, use fromArgv and catch the exception.
     *
     * @param process
     * @returns
     */
    fromArgvOrExit(process: NodeProcessLike) {
        try {
            return this.fromArgv(process.argv)
        } catch (e) {
            if (e instanceof OptExit) {
                e.outputAndExit(process)
            }
            throw e
        }
    }

    /**
     *
     * @param args
     * @returns
     */
    fromProgramArgs(args: string[]): { [k in keyof O]: O[k]["initialValue"] } & { [k in keyof P]: P[k]["initialValue"] } {
        const knownShortOpts: Record<string, { canonicalName: string, opt: OptWrapper }> = {}
        for (const [k, v] of Object.entries(this.options)) {
            const config = { canonicalName: k, opt: v }
            for (const a of v.alias) {
                knownShortOpts[a] = config
            }
        }

        const opts = new Opts(this.options, this.positional)
        const positional: string[] = []
        const mArgs = args.slice()

        const cNames = Object.fromEntries(
            Object.keys(this.options).map(k => [this.toCliArg(k), k])
        )

        let arg: string | undefined
        while ((arg = mArgs.shift()) !== undefined) {
            const parsed = this.parseArg(arg)
            if (parsed instanceof LongOption) {
                // Long opt.
                const cName = cNames[parsed.key]
                const opt = this.options[cName]
                if (!opt) {
                    throw new OptError(`Error: Unrecognised long option ${parsed.key}`, 5)
                }
                opts.addOptArg(cName, this.getArgValue(parsed.key, opt, () => mArgs.shift(), parsed.value))
            } else if (parsed instanceof ShortOptions) {
                // Short opts.
                let optionCode: string | undefined
                while (optionCode = parsed.next()) {
                    const config = knownShortOpts[optionCode]
                    if (!config) {
                        throw new OptError(`Error: Unrecognised short option ${parsed.prevOption} in ${parsed.literalArgument}`, 3)
                    }
                    const cName = config.canonicalName
                    opts.addOptArg(cName, this.getArgValue(parsed.prevOption!, config.opt, () => parsed.rest.length ? parsed.rest : mArgs.shift()))
                }
            } else if (parsed instanceof AbortProcessingSymbol) {
                // Stop processing
                positional.push(...mArgs)
                break
            } else {
                positional.push(parsed.literalArgument)
            }
        }

        const helpOption = this.helpOption
        if (helpOption && opts.values[helpOption]) {
            throw new OptHelpExit(this.helpMessage)
        }

        if(Object.values(this.positional).some(opt => opt.many)) {

        }

        const seen = new Set<string>()

        // Careful ordering here to support having variable items in the middle.
        // 1. Required single args at the start
        for (const [name, opt] of Object.entries(this.positional)) {
            if(opt.many || !opt.required) {
                break
            }
            seen.add(name)
            const v = positional.shift()
            if (v === undefined) {
                throw new OptError(`Argument <${name}> is required.\n${this.helpMessage}`, 1)
            }
            opts.addPositionArg(name, this.getPositionArgValue(name, opt, v))
        }

        // 2. Required single args at the end
        for (const [name, opt] of Object.entries(this.positional).reverse()) {
            if(opt.many || !opt.required) {
                break
            }
            if(seen.has(name)) {
                break // This would happen if all were required-single.
            }
            seen.add(name)
            const v = positional.pop()
            if (v === undefined) {
                throw new OptError(`Argument <${name}> is required.\n${this.helpMessage}`, 1)
            }
            opts.addPositionArg(name, this.getPositionArgValue(name, opt, v))
        }

        // 3. Everything else
        for (const [name, opt] of Object.entries(this.positional)) {
            if(seen.has(name)) {
                continue
            }
            const v = positional.shift()
            if (v === undefined && opt.required) {
                throw new OptError(`Argument <${name}> is required.\n${this.helpMessage}`, 1)
            }
            if (v !== undefined) {
                opts.addPositionArg(name, this.getPositionArgValue(name, opt, v))
                if (opt.many) {
                    for (const nv of positional) {
                        opts.addPositionArg(name, this.getPositionArgValue(name, opt, nv))
                    }
                    positional.splice(0) // Empties
                }
            }
        }

        if (positional.length) {
            throw new OptError(`Too many arguments at: ${positional[0]}.\n${this.helpMessage}`, 2)
        }

        return opts.values
    }
}