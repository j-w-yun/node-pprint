# @nopecha/pprint

[![npm version](https://badge.fury.io/js/%40nopecha%2Fpprint.svg)](https://badge.fury.io/js/%40nopecha%2Fpprint)

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

```typescript
global.log('!r', 'this is red')
global.log('!g', 'this is green')
global.log('!b', 'this is blue')
global.error('this is error')
global.warn('this is warn')
```

Add background colors with a second color code.

```typescript
global.log('!rb', 'this is red on blue')
```

Multiple colors can be used in a single log statement.

```typescript
global.log('!r', 'this is red', '!', ' this is normal ', '!b', 'this is blue')
```

## Copyright

&copy; 2024 [NopeCHA, LLC](https://nopecha.com/)
