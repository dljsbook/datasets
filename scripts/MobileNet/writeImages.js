const fs = require('fs');
const {
  ALL_IMAGES,
  MAX_NUM_IMAGES,
  DATA_PATH,
  IMAGE_HEALTH,
} = require('./config');

const imagesAll = require(ALL_IMAGES);
const imageHealth = require(IMAGE_HEALTH);

(async function() {
  const entries = Object.entries(imagesAll);
  const images = {};

  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    images[key] = [];

    if (imageHealth[key]) {
      for (let j = 0; j < values.length; j++) {
        if (images[key].length < MAX_NUM_IMAGES && imageHealth[key][j] === 1) {
          images[key].push(values[j]);
        }
      }

      fs.writeFileSync(
        `${DATA_PATH}/images.json`,
        JSON.stringify(images)
      );
    }
  }
})();
