const path = require('path');

const DATA_ROOT = path.resolve(__dirname, '../../data/ImageNet');

module.exports.DATA_ROOT = DATA_ROOT;
module.exports.MAX_NUM_IMAGES = 1000;
module.exports.ALL_IMAGES = `${DATA_ROOT}/all-images.json`;
module.exports.IMAGE_HEALTH = `${DATA_ROOT}/image-health.json`;
module.exports.NUM_TO_IDS = `${DATA_ROOT}/num-to-ids.json`;
module.exports.IMAGES = `${DATA_ROOT}/images.json`;
