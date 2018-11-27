const fs = require('fs');
const request = require('request');
const dns = require('dns');

const {
  ALL_IMAGES,
  IMAGE_HEALTH,
  PARALLEL,
  TIMEOUT,
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
  }, TIMEOUT);


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

const main = async () => {
  const entries = Object.entries(imagesAll);
  const callbacks = [];

  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    if (!imageHealth[key]) {
      imageHealth[key] = {};
    }

    for (let index = 0; index < values.length; index++) {
      if (imageHealth[key][index] === undefined) {
        callbacks.push({
          key,
          index,
          values,
        });
      }
    }
  }

  console.log(`${callbacks.length} fns in total`);

  parallelize(PARALLEL, callbacks.map(({
    key,
    index,
    values,
  }, i) => async () => {
    try {
      await checkNetworkConnectivity();
    } catch(err) {
      return;
    }
    const url = values[index];
    console.log([
      callbacks.length - i,
      key,
      index,
    ].join(' | '));
    try {
      await check(url);
      imageHealth[key] = {
        ...imageHealth[key],
        [index]: 1,
      };
    } catch(err) {
      console.error(err);
      imageHealth[key] = {
        ...imageHealth[key],
        [index]: 0,
      };
    }

    fs.writeFileSync(
      IMAGE_HEALTH,
      JSON.stringify(imageHealth)
    );
  }));
};

const wait = (ms, id) => new Promise(resolve => {
  console.log('start', id);
  setTimeout(() => {
    console.log('complete', id);
    resolve();
  }, ms);
});

const checkNetworkConnectivity = () => new Promise((resolve, reject) => dns.resolve('www.google.com', (err) => {
  if (err) {
    reject();
  } else {
    resolve();
  }
}));

const parallelize = async (parallel, callbacks) => {
  for (let i = 0; i < parallel; i++) {
    (async () => {
      while (callbacks.length > 0) {
        const fn = callbacks.shift();
        await fn();
      }
    })();
  }
};

main();
