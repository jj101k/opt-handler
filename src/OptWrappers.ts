import { OptWrapper } from "./OptWrapper"
import { OptWrapperMany } from "./OptWrapperMany"
import { TypeHintExplicit, TypeHintImplicit, TypeHintMulti } from "./TypeHint"

/**
 *
 */
export class OptWrappers {
    /**
     *
     * @param type
     * @param aliases
     * @returns Value extractor (optional)
     */
    static opt(type: "boolean", ...aliases: string[]): OptWrapper<boolean>
    static opt(type: "number", ...aliases: string[]): OptWrapper<number | undefined>
    static opt(type: "number[]", ...aliases: string[]): OptWrapper<number[]>
    static opt(type: "string", ...aliases: string[]): OptWrapper<string | undefined>
    static opt(type: "string[]", ...aliases: string[]): OptWrapper<string[]>
    static opt(type: TypeHintExplicit | TypeHintImplicit | TypeHintMulti, ...aliases: string[]): OptWrapper<number[] | string[] | boolean | number | string | undefined> {
        switch(type) {
            case "number[]":
                return new OptWrapperMany<any>(aliases, "number", false)
            case "string[]":
                return new OptWrapperMany<any>(aliases, "string", false)
            default:
                return new OptWrapper(aliases, type, false)
        }
    }

    /**
     *
     * @param type
     * @param def
     * @param aliases
     * @returns Value extractor (optional, with a default value)
     */
    static optDefault(type: "number", def: number, ...aliases: string[]): OptWrapper<number>
    static optDefault(type: "string", def: string, ...aliases: string[]): OptWrapper<string>
    static optDefault(type: TypeHintExplicit, def: number | string, ...aliases: string[]): OptWrapper<boolean | number | string> {
        return new OptWrapper(aliases, type, false, def)
    }

    /**
     *
     * @param type
     * @param aliases
     * @returns Value extractor (required)
     */
    static req(type: "number[]", ...aliases: string[]): OptWrapper<number[]>
    static req(type: "string[]", ...aliases: string[]): OptWrapper<string[]>
    static req(type: "number", ...aliases: string[]): OptWrapper<number>
    static req(type: "string", ...aliases: string[]): OptWrapper<string>
    static req(type: TypeHintExplicit | TypeHintMulti, ...aliases: string[]): OptWrapper<number[] | string[] | number | string> {
        switch(type) {
            case "number[]":
                return new OptWrapperMany<any>(aliases, "number", true)
            case "string[]":
                return new OptWrapperMany<any>(aliases, "string", true)
            default:
                return new OptWrapper(aliases, type, true)
        }
    }
}