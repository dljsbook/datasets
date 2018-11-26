const fs = require('fs');
const path = require('path');
const DATA_PATH = path.resolve(__dirname, '../../data/MobileNet');
const MAX_NUM_IMAGES = 10;

const imagesAll = require(`${DATA_PATH}/all-images.json`);
const imageHealth = require(`${DATA_PATH}/image-health.json`);

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
