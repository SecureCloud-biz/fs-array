// Make Sync the new Async, with sane utf-8 defaults and absolute paths
const fs = require('fs');
const path = require('path');

const abs = (name = '.', base = process.cwd()) =>
  path.isAbsolute(name) ? name : join(base, name);

// Method for those functions that are an action and we don't want them to fail
const noFail = fn => (...args) => {
  try {
    // Return true-ish if it doesn't fail
    return fn(...args);
  } catch (err) {
    return err;
  }
};

const join = (...args) => abs(path.join(...args));

// My own, "easier" fs. Sync since there is no multirequests
module.exports = {
  abs,
  dir: (name = '.') => fs.readdirSync(abs(name)).map(file => join(name, file)),
  exists: name => fs.existsSync(abs(name)),
  join,
  mkdir: noFail(name => fs.mkdirSync(abs(name))),
  read: (name = '.') => fs.readFileSync(abs(name), 'utf-8'),
  stat: (name = '.') => fs.lstatSync(abs(name)),
  write: noFail((file, body) => fs.writeFileSync(abs(file), body, 'utf-8')),
};
