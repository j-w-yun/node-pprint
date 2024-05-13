# @nopecha/pprint

[![npm version](https://badge.fury.io/js/@nopecha%2Fpprint.svg)](https://badge.fury.io/js/@nopecha%2Fpprint)

This package provides pretty-print logging functions for Node.js.

## Installation

```bash
npm install @nopecha/pprint
```

## Usage

Add to the top of the entry file of the project.

```typescript
import '@nopecha/pprint'
```

The above will expose the pretty-print logging functions to the global scope.

Replace `console` with `global` to color-code terminal outputs in Node.js.

Available are `trace`, `debug`, `info`, `log`, `warn`, and `error`.

```typescript
global.trace()  // Red
global.debug('this is green')
global.info('this is cyan')
global.warn('this is yellow')
global.error('this is red')
global.log('this does not have a color yet')
```

Add color to `log` messages. Color codes are prefixed with `!` in their own string.

```typescript
global.log('!r', 'this is red')
global.log('!g', 'this is green')
global.log('!b', 'this is blue')
```

Add background colors with a second color code.

```typescript
global.log('!rb', 'this is red on blue')
```

Add text styles with a third color code.

```typescript
global.log('!uwd', 'underlined')    // underlined, white on dark
global.log('!bdw', 'bolded')        // bolded, dark on white
global.log('!igw', 'italicized')    // italicized, green on white
```

Multiple colors can be used in a single log statement.

Note that all color code strings including `"!"` are zero width, except `"! "` where a color-stop code can contain a space that is left untrimmed.

```typescript
global.log('!r', 'this is red', '!', ' this is normal ', '!b', 'blue', '! ', 'normal')
```

## Copyright

&copy; 2024 [NopeCHA, LLC](https://nopecha.com/)
