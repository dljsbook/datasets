const yargs = require('yargs').argv;
const mkdirp = require('mkdirp');
const fs = require('fs');
const writePerFile = require('../writePerFile');

const {
  CATEGORIES,
  SUPERCATEGORIES,
  IN_DIR,
  // IMAGES,
  FILES,
  PER_FILE,
  MANIFEST,
} = require('./config');

if (!yargs.source) {
  throw new Error('You must provide a source');
}

if (!yargs.dir) {
  throw new Error('You must provide a directory');
}

const contents = fs.readFileSync(yargs.source);
const file = JSON.parse(contents);

const {
  categories,
  supercategories,
} = file.categories.reduce(({
  supercategories,
  categories,
}, c) => ({
  categories: {
    ...categories,
    [c.id]: c.name,
  },
  supercategories: {
    ...supercategories,
    [c.supercategory]: [
      ...(supercategories[c.supercategory] || []),
      c.id,
    ],
  },
}), {
  categories: {},
  supercategories: {},
});

fs.writeFileSync(
  IN_DIR(yargs.dir, CATEGORIES),
  JSON.stringify(categories),
);
fs.writeFileSync(
  IN_DIR(yargs.dir, SUPERCATEGORIES),
  JSON.stringify(supercategories),
);

const annotations = file.annotations.reduce((obj, ann) => ({
  ...obj,
  [ann.image_id]: [
    ...(obj[ann.image_id] || []),
    {
      cat: ann.category_id,
      bbox: ann.bbox,
    },
  ],
}), {});

const images = file.images.reduce((obj, img) => ({
  ...obj,
  [img.id]: {
    file: img.file_name,
    h: img.height,
    w: img.width,
    anns: annotations[img.id],
  },
}), {});

(async () => {
  await writePerFile(images, {
    perFile: PER_FILE,
    files: FILES,
    manifest: IN_DIR(yargs.dir, MANIFEST),
    imageDir: (path) => {
      const d = IN_DIR(yargs.dir, `images`);
      mkdirp(d);
      const p = `${d}/${path}.json`;
      return p;
    },
  });
})();
