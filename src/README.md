# OptHandler

## Summary

A Javascript/Typescript UNIX-style options handler.

If you want to have command-line arguments like `--my-option=opt` and `--with-this`
and you want to have them look like `{myOption: "opt", withThis: true}` in your
program, this will do so with matching types so that your IDE can autocomplete.

## Synopsis

```js
import { OptHandler, OptWrappers } from "opt-handler"

const optHandler = new OptHandler({
    options: {
        entryPoint: OptWrappers.opt("number[]", "e"),
        help: OptWrappers.opt("boolean", "h"),
        includeVersion: OptWrappers.opt("boolean", "v"),
        loadPoint: OptWrappers.req("number", "l"),
        startPoint: OptWrappers.optDefault("number", 1, "s"),
        writeFile: OptWrappers.opt("string", "w"),
    },
    positional: {
        filename: OptWrappers.req("string"),
    },
    help: "help",
}, process.argv[1])

const opts = optHandler.fromArgvOrExit(process)
```

## Features

* Automatic help message
* Correct types for your options & positional arguments
    * boolean
    * number
    * string
* Code-friendly names for your options & positional arguments
* Short argument support
* Default value support
* Automatic exit available for invalid arguments
* Support for arguments which may be provided multiple times (as an array).

## Guide

The shortest form is:

```js
const opts = new OptHandler({options: {}, positional: {}}, process.argv[1]).fromArgvOrExit(process)
```

This will permit no arguments at all. If any are provided, it will produce an
error and exit. You're telling it what arguments you're looking for (none), and
what the program name is for the help message; then you're asking it to parse
the arguments and return to you (or, if they are bad, to exit).

```js
const optHandler = new OptHandler({options: {},
    positional: {args: OptWrappers.opt("string[]")}}, process.argv[1])

const opts = optHandler.fromArgvOrExit(process)
console.log(opts.args)
```

This tells the handler that you are just looking for (opt) zero ([]) or more
string arguments, and that you want it to call them `args`. This will always be
an array, and always of strings; it will also be correctly typed for your IDE
and Typescript.

```js
const optHandler = new OptHandler({
    options: {myNewOption: OptWrappers.req("number", "n")},
    positional: {args: OptWrappers.opt("string[]")}}, process.argv[1])

const opts = optHandler.fromArgvOrExit(process)
console.log(opts.myNewOption)
```

This says that you also want (req) one `--my-new-option` or `-n` command-line
option which will accept a number, and will appear as `myNewOption`.

## Usage

### OptHandler

#### new OptHandler(...)

The constructor accepts options for parsing the command line args, as well as a
name for the help message.

In the options, you have:

* `options`: The command-line options to use, keyed by the name you want in the
  output. The equivalent arg name will be auto-generated. These are not strictly
  ordered.
* `positional`: The positional arguments to use. The names are not used in
  parsing but are present in the output. The order is strictly the same as when
  you defined them. See the notes below on limitations with positional
  arguments.
* `help`: If you set up a help option, you can refer to its name here, and if
  the argument is present the handler will attempt to trigger the help message
  and stop further processing. See the instance methods below.

The help message which is used is automatically constructed from the supplied
program name and the defined arguments.

#### fromArgv()

This returns a key-value object built from an _argv_ array, eg. `process.argv`.
In accordance with Node convention, the first two arguments are expected to be
the Node interpreter itself and the path of your script, so they are dropped.
That aside, it works the same as `fromProgramArgs()`.

#### fromArgvOrExit()

This wraps `fromArgv()` with handling for exit conditions (bad arguments, or the
user setting the "help" option). This will immediately exit (in Node) under
those conditions. It accepts an object equivalent to Node's `process`.

#### fromProgramArgs()

This accepts the arguments which come after the program name, and returns a
key-value object representing the options selected. It may also throw an
exception if the arguments weren't valid (`OptError`) or if the "help" option
was requested (`OptExitHelp`). In general you're more likely to want to use
`fromArgvOrExit()`.

### OptWrappers & OptWrapper

`OptWrappers` is a factory class which can return `OptWrapper` objects. These
convey:

* Other names by which the option will be known
* The type of the data being conveyed (and whether the argument can appear
  several times)
* Whether the argument is required
* If it's optional, what value to use when it's missing.

The main name of the argument is provided by the structure of the `OptHandler`
constructor call.

#### OptWrappers.opt(type, ...aliases)

This represents an optional argument. Types can be "boolean" (meaning it is
either supplied or not, for options; or can be true/false/1/0 for positional
arguments), "string" or "number"; you can also indicate that you want to support
multiple using "string[]" or "number[]".

The aliases appear after other arguments, each a single-character string for
single-character (`-?` not `--?-?`) options.

#### OptWrappers.optDefault(type, def, ...aliases)

Represents an optional single argument with a default value of the correct type.
This only supports "string" or "number".

#### OptWrappers.req(type, ...aliases)

Represents a required argument. This is used the same way as `opt()`; if there's
a required multiple argument, it must be supplied at least once.

# Notes

## Option handling convention

This follows UNIX convention which is broadly:

* Options can be mixed with positional arguments (though this is discouraged)
* Short options start with a single dash `-` followed by a single letter. Where
  an option takes a value, it's expected to be in the next argument. As special
  cases, an option which doesn't take a value may be combined with another, eg.
  `-a -b` can be written as `-ab`. An option which does take an argument can be
  combined with its content, eg. `-c /some/file` can be written as
  `-c/some/file`. Short options are generally discouraged for being too cryptic
  so every short option has a long counterpart.
* Long options start with a double-dash `--`, followed by a series of blocks of
  lower-case letters each separated by a single `-`. Where they take arguments,
  they can either be supplied with an `=` and the literal value at the end of
  the argument, or in the next argument.
* You can indicate that all subsequent arguments are positional not options (eg.
  to preserve arguments which might look like options) using an argument which
  is just `--`.


## Positional argument limitations

This broadly follows function argument "varargs" conventions for positional
arguments. What this means is having a defined minimum set of arguments entirely
at the start, and with each subsequent optional argument not affecting how the
previous arguments are parsed. This might seem surprising if you have exactly
one optional argument, but it becomes complicated very quickly as soon as you
have two - if the argument length indicates that one optional argument hasn't
been supplied, which one is it?

In the earliest days of UNIX, there was no such convention, so many of the core
tools (`cp`, `mv`, `ln`) have a slightly different rule, where there is a
defined minimum set of required arguments on each end, and optional ones go in
the middle (when all the optional arguments have the same meaning, at least). To
support that style, this also supports required options at the end.

What this means is that in practice you can have:

```
required
required
optional
optional
```

As well as:

```
required
required
optional
optional
required
```

But you cannot have:

```
required
required
optional
required
optional
required
```

Note that for this purpose, an optional-multiple argument is the same as a
variable number of single optional arguments, and a required-multiple argument
is the same as a required argument followed by a variable number of single
optional arguments.

## Shells, escaping & argument splitting

You might be aware of using escapes like `\ ` or quoting arguments (`""`) on the
command line. That's not something that's handled by the program - in fact, even
the operating system receives the arguments as a neatly packaged array of
individual strings. That functionality is handled entirely by the shell used by
the calling user. This framework does nothing related to escaping or unescaping,
so if you're seeing odd results, you should try it in a shell itself. For
example, if you have typed `a b c\ d` as your program arguments, you can see how
your shell breaks them down like:

```sh
% sh -c 'for n in "$@"; do echo "\"$n\""; done' a b c\ d
"b"
"c d"
```