const path = require('path');
const fs = require('fs');

module.exports = dir => {
    let current = '';
    for (const part of dir.split(path.sep)) {
        current = `${current}${path.sep}${part}`;
        if (!fs.existsSync(current)) fs.mkdirSync(current);
    }
};
