# Instrument Bundler

## Usage

`InstrumentBundler` is used with an array of `BundlerInput` objects. Each input represents a file and includes `content` and `name` properties, for example:

```ts
const input = {
  name: 'hello.js',
  content: "console.log('hello world')"
};
```

## Entry File

An instrument repository contains a collection of files, one of which is considered to be the index file. The index file must have a default export which defines the instrument.

To resolve the index file, the bundler checks for the following file names (in order):

- `index.tsx`
- `index.jsx`
- `index.ts`
- `index.js`

If none of the bundler inputs match the above list, an exception is raised.

## Imports

After resolving the index file, the bundler attempts to resolve imported code according to the following rules:

1. Dynamic imports beginning with `/` are marked as external. All other dynamic imports will trigger an exception.
