const yargs = require('yargs').argv;
const mkdirp = require('mkdirp');
const path = require('path');

const DATA_ROOT = path.resolve(__dirname, '../../data/Coco');

module.exports.DATA_ROOT = DATA_ROOT;
module.exports.PER_FILE = yargs.perFile || 100;
module.exports.FILES = yargs.files || 10;
module.exports.MANIFEST = `images/manifest.json`;
module.exports.CATEGORIES = `categories.json`;
module.exports.SUPERCATEGORIES = `supercategories.json`;
module.exports.IN_DIR = (dir, path) => {
  mkdirp(DATA_ROOT);
  mkdirp(`${DATA_ROOT}/${dir}`);
  return `${DATA_ROOT}/${dir}/${path}`;
};
