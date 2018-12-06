const fs = require('fs');
const mkdirp = require('mkdirp');
const write = require('../writeFile');
const {
  MANIFEST,
  ALL_IMAGES,
  PER_FILE,
  FILES,
  // DATA_PATH,
  IMAGE_HEALTH,
  NUM_TO_IDS,
  IMAGES,
  IMAGE_ROOT,
} = require('./config');

if (!MANIFEST) {
  throw new Error('No manifest defined');
}

const imagesAll = require(ALL_IMAGES);
const imageHealth = require(IMAGE_HEALTH);
const idsToNums = Object.entries(require(NUM_TO_IDS)).reduce((obj, [key, value]) => ({
  ...obj,
  [value]: key,
}), {});
const getJSONFile = (file) => {
  try {
    const contents = fs.readFileSync(file, 'utf8');
    return JSON.parse(contents);
  } catch(err) {
    return {};
  }
};

const writeFiles = fileId => {
  const file = imagesByFile[fileId];
  write(
    IMAGES(fileId),
    JSON.stringify(file),
  );

  write(
    MANIFEST,
    JSON.stringify(manifest),
  );
};

const manifest = getJSONFile(MANIFEST);
const {
  imagesByFile,
  images,
} = Object.keys(manifest).sort().reduce(({ imagesByFile, images }, key) => {
  const idx = manifest[key].split('/').pop().split('.').shift();
  const path = IMAGES(idx);
  const file = getJSONFile(path);
  return {
    imagesByFile: {
      ...imagesByFile,
      [key]: file,
    },
    images: Object.entries(file).reduce((imageObj, [id, values]) => ({
      ...imageObj,
      [id]: [
        ...(imageObj[id] || []),
        ...values,
      ],
    }), images),
  };
}, {
  imagesByFile: {},
  images: {},
});

(async function() {
  const entries = Object.entries(imagesAll);

  // console.log(`${entries.length} entries`);

  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    const id = idsToNums[key];
    if (!images[id]) {
      images[id] = [];
    }

    if (imageHealth[key]) {
      const max = PER_FILE * FILES < values.length ? PER_FILE * FILES : values.length;
      // console.log(`\n${key} | ${values.length} values | ${max} max | `);
      let valueId = images[id].length === undefined ? 0 : images[id].length - 1 ;
      while (images[id].length < max && valueId < values.length) {
        const isHealthy = imageHealth[key][valueId] === 1;
        if (isHealthy) {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`${entries.length - i} labels remaining | ${max - valueId} images remaining `);
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

          manifest[fileId] = `images/${fileId}.json`;

          if (!imagesByFile[fileId]) {
            imagesByFile[fileId] = {};
          }

          if (!imagesByFile[fileId][id]) {
            imagesByFile[fileId][id] = [];
          }
          imagesByFile[fileId][id].push(value);

          writeFiles(fileId);
        }
        valueId++;
      }
    } else {
      console.log(`missing image health for ${key}`);
    }
  }
})();

