const fs = require('fs');

const writePerFile = async (obj, {
  perFile,
  files,
  manifest,
  imageDir,
}) => {
  const values = Object.values(obj);
  const byFile = {};

  const max = files * perFile > values.length ? values.length : files * perFile;

  for (let i = 0; i < max; i++) {
    console.log('id', i);
    const value = values[i];

    const fileKey = Array(files).fill('').reduce((found, _, key) => {
      if (found !== undefined) {
        return found;
      }

      const values = byFile[key];

      if (!values) {
        return key;
      }

      if (values.length < perFile) {
        return key;
      }

      return undefined;
    }, undefined);


    if (fileKey === undefined) {
      throw new Error('file key is undefined');
    }

    if (!byFile[fileKey]) {
      byFile[fileKey] = [];
    }

    byFile[fileKey].push(value);
  }

  const manifestList = {};

  Object.keys(byFile).map(fileKey => {
    const file = byFile[fileKey];
    fs.writeFileSync(
      imageDir(fileKey),
      JSON.stringify(file),
    );

    manifestList[fileKey] = `images/${fileKey}.json`;

    fs.writeFileSync(
      manifest,
      JSON.stringify(manifestList),
    );
  });
};

module.exports = writePerFile;
