declare global {
    var log: (...args: unknown[]) => void
    var debug: (...args: unknown[]) => void
    var info: (...args: unknown[]) => void
    var warn: (...args: unknown[]) => void
    var error: (...args: unknown[]) => void
    var trace: () => void
}
export {}
