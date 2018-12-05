const fs = require('fs');
const mkdirp = require('mkdirp');
const write = (file, contents) => {
  const pieces = file.split('/');
  pieces.pop();
  pieces.filter(p => p).forEach((piece, index) => {
    const d = pieces.slice(0, index + 1).join('/');
    mkdirp(d);
  });
  const dir = pieces.join('/');
  mkdirp(dir);
  fs.writeFileSync(
    file,
    contents,
  );
};

module.exports = write;
