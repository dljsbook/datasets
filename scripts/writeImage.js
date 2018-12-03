const fs = require('fs');
const request = require('request');

module.exports = (url, target) => new Promise((resolve, reject) => {
  request.get({
    url,
    encoding: 'binary',
  }, (err, response, body) => {
    fs.writeFile(target, body, 'binary', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});
