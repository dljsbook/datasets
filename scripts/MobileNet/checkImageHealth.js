const fs = require('fs');
const request = require('request');

const {
  ALL_IMAGES,
  IMAGE_HEALTH,
} = require('./config');

const imagesAll = require(ALL_IMAGES);
let imageHealth;
try {
  imageHealth = require(IMAGE_HEALTH);
} catch(err) {
  imageHealth = {};
}
const getType = type => {
  if (type === 'image/jpeg' || type === 'image/jpg') {
    return 'jpg';
  } else if (type === 'image/png') {
    return 'png';
  } else if (type === 'image/gif') {
    return 'gif';
  }

  return null;
};

const check = (uri) => new Promise((resolve, reject) => {
  let resolved = false;
  const r = (fn) => {
    if (resolved === false) {
      resolved = true;
      fn();
    }
  };

  setTimeout(() => {
    r(() => reject(`Timeout error for ${uri}`));
  }, 10000);


  request.head(uri, (err, res) => {
    if (!res) {
      return r(() => reject(`No res found for: ${uri}`));
    }
    const type = getType(res.headers['content-type']);
    if (!type) {
      return r(() => reject(`Invalid type: ${type} for URL: ${uri}`));
    }

    return request(uri).on('response', () => {
      r(() => resolve());
    }).on('close', () => {
      r(() => resolve());
    }).on('error', (err) => {
      r(() => reject(err));
    });
  });
});

(async function() {
  const entries = Object.entries(imagesAll);
  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    if (!imageHealth[key]) {
      imageHealth[key] = {};
    }

    for (let j = 0; j < values.length; j++) {
      if (imageHealth[key][j] === undefined) {
        console.log(key, j);
        const url = values[j];
        try {
          await check(url);
          imageHealth[key] = {
            ...imageHealth[key],
            [j]: 1,
          };
        } catch(err) {
          console.error(err);
          imageHealth[key] = {
            ...imageHealth[key],
            [j]: 0,
          };
        }
      }

      fs.writeFileSync(
        IMAGE_HEALTH,
        JSON.stringify(imageHealth)
      );
    }
  }
})();

