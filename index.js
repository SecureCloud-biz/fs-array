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
