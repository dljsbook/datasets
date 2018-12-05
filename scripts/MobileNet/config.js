const path = require('path');
const yargs = require('yargs').argv;

const DATA_ROOT = path.resolve(__dirname, '../../data/ImageNet');
const IMAGE_ROOT = `${DATA_ROOT}/images`;

module.exports.DATA_ROOT = DATA_ROOT;
module.exports.IMAGE_ROOT = IMAGE_ROOT;
module.exports.PER_FILE = yargs.perFile || 100;
module.exports.FILES = yargs.files || 10;
module.exports.ALL_IMAGES = `${DATA_ROOT}/all-images.json`;
module.exports.IMAGE_HEALTH = `${DATA_ROOT}/image-health.json`;
module.exports.NUM_TO_IDS = `${DATA_ROOT}/num-to-ids.json`;
module.exports.PARALLEL = 50;
module.exports.TIMEOUT = 20000;
module.exports.MANIFEST = `${IMAGE_ROOT}/manifest.json`;
module.exports.IMAGES = (i) => `${IMAGE_ROOT}/${i}.json`;

