const fs = require('fs');
const {
  ALL_IMAGES,
  MAX_NUM_IMAGES,
  DATA_PATH,
  IMAGE_HEALTH,
  NUM_TO_IDS,
  IMAGES,
} = require('./config');

const imagesAll = require(ALL_IMAGES);
const imageHealth = require(IMAGE_HEALTH);
const idsToNums = Object.entries(require(NUM_TO_IDS)).reduce((obj, [key, value]) => ({
  ...obj,
  [value]: key,
}), {});

(async function() {
  const entries = Object.entries(imagesAll);
  const images = {};

  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    const id = idsToNums[key];

    images[id] = [];

    if (imageHealth[key]) {
      for (let j = 0; j < values.length; j++) {
        if (images[id].length < MAX_NUM_IMAGES && imageHealth[key][j] === 1) {
          images[id].push(values[j]);
        }
      }

      fs.writeFileSync(
        IMAGES,
        JSON.stringify(images)
      );
    }
  }
})();
