const path = require('path');
const fs = require('fs');

/**
 * Ensure that a given directory exists
 * @param {string} dir Directory to create if it does not exist
 */
module.exports = dir => {
    let current = '';
    for (const part of dir.split(path.sep)) {
        current = `${current}${path.sep}${part}`;
        if (!fs.existsSync(current)) fs.mkdirSync(current);
    }
};
