const fs = require('fs');
const {
  ALL_IMAGES,
  PER_FILE,
  FILES,
  // DATA_PATH,
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
  const imagesByFile = {};
  const images = {};

  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    const id = idsToNums[key];

    images[id] = [];

    if (imageHealth[key]) {
      const max = PER_FILE * FILES < values.length ? PER_FILE * FILES : values.length;
      let valueId = 0;
      while (images[id].length < max && valueId < values.length) {
        if (imageHealth[key][valueId] === 1) {
          const value = values[valueId];
          images[id].push(value);

          const fileId = Array(FILES).fill('').reduce((found, _, key) => {
            const entries = imagesByFile[key];
            if (found !== undefined) {
              return found;
            }

            if (!entries || !entries[id]) {
              return key;
            }

            if (entries[id].length < PER_FILE) {
              return key;
            }

            return undefined;
          }, undefined);

          if (!imagesByFile[fileId]) {
            imagesByFile[fileId] = {};
          }

          if (!imagesByFile[fileId][id]) {
            imagesByFile[fileId][id] = [];
          }
          imagesByFile[fileId][id].push(value);
        }
        valueId++;
      }
    }
  }


  Object.keys(imagesByFile).map(fileId => {
    const file = imagesByFile[fileId];
    fs.writeFileSync(
      IMAGES(fileId),
      JSON.stringify(file),
    );
  });
})();
