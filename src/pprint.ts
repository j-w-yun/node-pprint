/// <reference path="../global.d.ts" />

import util from 'util'

class Color {
    sgr: number | undefined
    fg: number | undefined
    bg: number | undefined
    trailing: string = ''

    constructor({ sgr = undefined, fg = undefined, bg = undefined }: { sgr?: number, fg?: number, bg?: number } = {}) {
        this.sgr = sgr
        this.fg = fg
        this.bg = bg
    }

    is_empty(): boolean {
        return !this.sgr && !this.fg && !this.bg
    }

    is_end(): boolean {
        return this.sgr === 0 && !this.fg && !this.bg
    }

    end(trailing: string = ''): void {
        this.sgr = 0
        this.fg = undefined
        this.bg = undefined
        this.trailing = trailing
    }

    clear(): void {
        this.sgr = undefined
        this.fg = undefined
        this.bg = undefined
    }

    build(): string {
        const colors = []
        if (this.sgr !== undefined) colors.push(this.sgr)
        if (this.fg !== undefined) colors.push(this.fg)
        if (this.bg !== undefined) colors.push(this.bg)
        return (colors.length === 0 ? pprint.e : `${pprint.esc}[${colors.join(';')}m${this.trailing}`) as string
    }

    toString(): string {
        return this.build()
    }
}

type _strings = 'esc' | 'e' | 'end' | 'bold' | 'dim' | 'italic' | 'underline' | 'sblink' | 'fblink' | 'reverse' | 'hidden' | 'cross' | 'DARK' | 'dark' | 'WHITE' | 'white' | 'RED' | 'red' | 'YELLOW' | 'yellow' | 'GREEN' | 'green' | 'CYAN' | 'cyan' | 'BLUE' | 'blue' | 'PURPLE' | 'purple' | 'D' | 'd' | 'W' | 'w' | 'R' | 'r' | 'Y' | 'y' | 'G' | 'g' | 'C' | 'c' | 'B' | 'b' | 'P' | 'p'
type _voidfns = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'trace'
type _colormap = '_sgr' | '_fg' | '_bg'
type _reserved = 'parse' | 'rules' | 'depth' | _strings | _voidfns | _colormap

type _pprint = {
    parse: (args: unknown[]) => unknown[]
    rules: Array<Array<{ map: Record<string, number>; type: 'sgr' | 'fg' | 'bg'} >>
    depth: number
}
& { [k in _strings]: string }
& { [k in _voidfns]: (...args: unknown[]) => void }
& { [k in _colormap]: Record<string, number> }
& Partial<{ [k: Exclude<string, _reserved>]: unknown }>

const pprint: _pprint = {} as _pprint

pprint.depth = 8
pprint.esc = '\x1b'
pprint.e = '\x1b[0m'

// Select graphics rendition
pprint._sgr = {
    end: 0,
    bold: 1,
    dim: 2,
    italic: 3,
    underline: 4,
    sblink: 5,
    fblink: 6,
    reverse: 7,
    hidden: 8,
    cross: 9,
}

// Capital letters are bright, except black
pprint._fg = {
    DARK: 90,  // Gray
    dark: 30,  // Black
    WWHITE: 97,  // WHITE
    white: 37,  // white
    RED: 91,  // RED
    red: 31,  // red
    YELLOW: 93,  // YELLOW
    yellow: 33,  // yellow
    GREEN: 92,  // GREEN
    green: 32,  // green
    CYAN: 96,  // CYAN
    cyan: 36,  // cyan
    BLUE: 34,  // BLUE
    blue: 94,  // blue
    PURPLE: 95,  // PURPLE
    purple: 35,  // purple
}

pprint._bg = {
    DARK: 100,  // Gray
    dark: 40,   // Black
    WWHITE: 107,  // WHITE
    white: 47,   // white
    RED: 101,  // RED
    red: 41,   // red
    YELLOW: 103,  // YELLOW
    yellow: 43,   // yellow
    GREEN: 102,  // GREEN
    green: 42,   // green
    CYAN: 106,  // CYAN
    cyan: 46,   // cyan
    BLUE: 44,   // BLUE
    blue: 104,  // blue
    PURPLE: 105,  // PURPLE
    purple: 45,   // purple
}

pprint.parse = function (args: unknown[]): unknown[] {
    const parsed = []
    for (const a of args) {
        if (typeof a !== 'string' || !a.startsWith('!') || a.length > 4) {
            parsed.push(a)
            continue
        }

        const elems = a.slice(1).split('')
        const color = new Color()

        // Clear color if only `!`
        if (elems.length === 0) {
            color.end()
            parsed.push(color)
            continue
        }
        // Clear color and add trailing whitespace if `![\s]+`
        if (elems.every(e => [' ', '!'].includes(e))) {
            color.end(' '.repeat(elems.length))
            parsed.push(color)
            continue
        }

        for (const [i, e] of elems.entries()) {
            if (['!', ' '].includes(e)) continue
            const o = pprint.rules[elems.length - 1][i]
            const v = o.map[e]
            if (!v) {
                color.clear()
                break
            }
            color[o.type] = v
        }

        if (!color.is_empty()) parsed.push(color)
        else parsed.push(a)
    }
    return parsed
}

pprint.log = function (...args: unknown[]): void {
    args = pprint.parse(args)

    let color = null
    let skip_sep = true
    for (const [i, arg] of args.entries()) {
        if (arg instanceof Color) {
            process.stdout.write(pprint.e)
            skip_sep = true
        }

        if (!skip_sep) process.stdout.write(' ')
        skip_sep = false

        if (color) process.stdout.write(color.toString())

        if (arg instanceof Color) {
            process.stdout.write(arg.toString())
            color = arg.is_end() ? null : arg
            skip_sep = true
        } else if (typeof arg === 'string') {
            process.stdout.write(arg)
        } else if (arg === null) {
            process.stdout.write(color ? color.toString() : pprint.bold)
            process.stdout.write('null')
            process.stdout.write(pprint.e)
        } else if (typeof arg === 'undefined') {
            process.stdout.write(color ? color.toString() : pprint.dark)
            process.stdout.write('undefined')
            process.stdout.write(pprint.e)
        } else if (typeof arg === 'symbol') {
            process.stdout.write(color ? color.toString() : pprint.green)
            process.stdout.write(arg.toString())
            process.stdout.write(pprint.e)
        } else if (typeof arg === 'boolean') {
            process.stdout.write(color ? color.toString() : pprint.yellow)
            process.stdout.write(arg.toString())
            process.stdout.write(pprint.e)
        } else if (typeof arg === 'number') {
            process.stdout.write(color ? color.toString() : pprint.yellow)
            process.stdout.write((arg === 0 && 1 / arg === -Infinity) ? '-0' : arg.toString())
            process.stdout.write(pprint.e)
        } else if (typeof arg === 'bigint') {
            process.stdout.write(color ? color.toString() : pprint.yellow)
            process.stdout.write(arg.toString() + 'n')
            process.stdout.write(pprint.e)
        } else if (typeof arg === 'object' || typeof arg === 'function') {
            process.stdout.write(util.inspect(arg, { showHidden: false, depth: pprint.depth, colors: !color }))
        } else {
            console.error('[@nope/pprint] unknown type', typeof arg, 'arg', arg)
        }
    }
    process.stdout.write(pprint.e)
    process.stdout.write('\n')
}

pprint.debug = function (...args: unknown[]): void {
    return pprint.log('!G', ...args)
}

pprint.info = function (...args: unknown[]): void {
    return pprint.log('!C', ...args)
}

pprint.warn = function (...args: unknown[]): void {
    return pprint.log('!Y', ...args)
}

pprint.error = function (...args: unknown[]): void {
    return pprint.log('!R', ...args)
}

pprint.trace = function (): void {
    const e = new Error()
    const stack = (e.stack ?? '').split('\n').slice(2)
    stack.unshift('Trace')
    pprint.log('!R', stack.join('\n'))
}

const psudonyms: Array<{ map: Record<string, number>, target: Record<string, unknown>, prefix: string[], allow_full: boolean, allow_single: boolean, compile: boolean }> = [
    { map: pprint._sgr, target: pprint as unknown as Record<string, unknown>, prefix: ['s', 'S'], allow_full: true, allow_single: false, compile: true },
    { map: pprint._fg, target: pprint as unknown as Record<string, unknown>, prefix: ['f', 'F'], allow_full: true, allow_single: true, compile: true },
    { map: pprint._bg, target: pprint as unknown as Record<string, unknown>, prefix: ['b', 'B'], allow_full: false, allow_single: false, compile: true },
    { map: pprint._sgr, target: pprint._sgr, prefix: ['s', 'S'], allow_full: false, allow_single: true, compile: false },
    { map: pprint._fg, target: pprint._fg, prefix: ['f', 'F'], allow_full: false, allow_single: true, compile: false },
    { map: pprint._bg, target: pprint._bg, prefix: ['b', 'B'], allow_full: false, allow_single: true, compile: false },
]
for (const e of psudonyms) {
    for (const [_k, v] of Object.entries(e.map)) {
        const ks = []
        for (const prefix of e.prefix) {
            ks.push(`${prefix}${_k[0]}`)
        }
        for (const k of ks) {
            if (e.target[k]) continue
            e.target[k] = e.compile ? `${pprint.esc}[${v}m` : v
        }
    }
    if (e.allow_single) {
        for (const [_k, v] of Object.entries(e.map)) {
            const k = _k[0]
            if (e.target[k]) continue
            e.target[k] = e.compile ? `${pprint.esc}[${v}m` : v
        }
    }
    if (e.allow_full) {
        for (const [k, v] of Object.entries(e.map)) {
            if (e.target[k]) continue
            e.target[k] = e.compile ? `${pprint.esc}[${v}m` : v
        }
    }
}
pprint.rules = [
    [{ map: pprint._fg, type: 'fg' }],
    [{ map: pprint._fg, type: 'fg' }, { map: pprint._bg, type: 'bg' }],
    [{ map: pprint._sgr, type: 'sgr' }, { map: pprint._fg, type: 'fg' }, { map: pprint._bg, type: 'bg' }],
]

global.log = pprint.log.bind(pprint)
global.debug = pprint.debug.bind(pprint)
global.info = pprint.info.bind(pprint)
global.warn = pprint.warn.bind(pprint)
global.error = pprint.error.bind(pprint)
global.trace = pprint.trace.bind(pprint)
