const yargs = require('yargs').argv;
const mkdirp = require('mkdirp');
const fs = require('fs');
const writePerFile = require('../writePerFile');
const writeImage = require('../writeImage');

const {
  CATEGORIES,
  SUPERCATEGORIES,
  IN_DIR,
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

const w = (file, contents) => {
  const pieces = file.split('/');
  pieces.pop();
  pieces.filter(p => p).forEach((piece, index) => {
    const d = pieces.slice(0, index + 1).join('/');
    mkdirp(d);
  });
  const dir = pieces.join('/');
  mkdirp(dir);
  fs.writeFileSync(
    file,
    contents,
  );
};

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

w(
  IN_DIR(yargs.dir, CATEGORIES),
  JSON.stringify(categories),
);
w(
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
  const files = await writePerFile(images, {
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

  const d = IN_DIR(yargs.dir, `images/data`);
  console.log('make', d);
  mkdirp(d);

  for (let i = 0; i < files.length; i++) {
    const imgs = files[i];
    for (let j = 0; j < imgs.length; j++) {
      const {
        file,
      } = imgs[j];

      if (file === undefined) {
        const msg = `Undefined file found, file ${i}, index ${j}`;
        throw new Error(msg);
      }

      const src = `http://images.cocodataset.org/${yargs.dir}/${file}`;
      const target = `${d}/${file}`
      console.log(src);
      writeImage(src, target);
    }
  }
})();
