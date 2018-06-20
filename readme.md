# File System Array

**Blocking** filesystem with very simple API specifically designed to be usable with arrays. Features:

- Return absolute paths where possible.
- Defaults to `'utf-8'` so no need to specify it. Won't return Buffers.
- Use the root of the running script where possible.
- Do not throw where possible (return an error).

Example: read all directories and find the main `index.html` on each of them.

```js
const { dir, exists, join, stat } = require('fs-array');
const files = dir(__dirname)
  .filter(src => stat(src).isDirectory())
  .map(src => join(src, 'index.html'))
  .filter(exists)
  .map(read);

console.log(files);
// ['<html>...</html>', '<html>...</html>', ...]

// Note: no actual need for filter isDir since exists will solve that anyway
```



## Blocking

[Blocking is horrible](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/). I know. Use only for those cases where you can spare few `ms` (and I mean it literally, not ironically). This will destroy the performance if you use it with something like `express` or my own `server`, so PELASE do not use it there.

Use it for:

- Launching a server (but not running it).
- Local scripts reading dozens of files (not thousands/millions).
- etc



## Documentation

No documentation. Feel free to look at all the 30 lines of the source at `index.js`, which I paste here for your convenience:

```js
// Make Sync the new Async, with utf-8 defaults and absolute paths
const fs = require('fs');
const path = require('path');

const abs = (name = '.', base = process.cwd()) =>
  path.isAbsolute(name) ? name : join(base, name);

// Method for those functions that are an action and we don't want them to fail
const noFail = fn => (...args) => {
  try { return fn(...args); } catch (err) { return err; }
};

const join = (...args) => abs(path.join(...args));
const name = path.basename;  // Get the path's filename
const dir = (name = '.') => fs.readdirSync(abs(name)).map(file => join(name, file));
const exists = name => fs.existsSync(abs(name));
const mkdir = noFail(name => fs.mkdirSync(abs(name)));
const read = (name = '.') => fs.readFileSync(abs(name), 'utf-8');
const stat = (name = '.') => fs.lstatSync(abs(name));
const write = noFail((file, body) => fs.writeFileSync(abs(file), body, 'utf-8'));

// Walk the walk (list all dirs and subdirectories)
const walk = (name = '.') => dir(abs(name))
  .map(src => stat(src).isFile() ? [src] : stat(src).isDirectory() ? walk(src) : [])
  .reduce((all, arr) => all.concat(arr), []);

// My own, "easier" fs. Sync since there is no multirequests
module.exports = { abs, dir, exists, join, mkdir, name, read, stat, walk, write };
```
