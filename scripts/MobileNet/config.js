const path = require('path');
const yargs = require('yargs').argv;

const DATA_ROOT = path.resolve(__dirname, '../../data/ImageNet');

module.exports.DATA_ROOT = DATA_ROOT;
module.exports.PER_FILE = yargs.perFile || 10;
module.exports.FILES = yargs.files || 10;
module.exports.ALL_IMAGES = `${DATA_ROOT}/all-images.json`;
module.exports.IMAGE_HEALTH = `${DATA_ROOT}/image-health.json`;
module.exports.NUM_TO_IDS = `${DATA_ROOT}/num-to-ids.json`;
module.exports.IMAGES = (i) => `${DATA_ROOT}/images/${i}.json`;
module.exports.PARALLEL = 50;
module.exports.TIMEOUT = 20000;
module.exports.MANIEST = `${DATA_ROOT}/images/manifest.json`;
