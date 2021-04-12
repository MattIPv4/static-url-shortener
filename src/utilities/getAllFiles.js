const fs = require('fs');
const path = require('path');

/**
 * Find all files in a given directory recursively
 * @param {string} dir The base directory to explore
 * @return {string[]}
 */
const getFilesInDir = dir => fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(file => (file.isDirectory()
        ? getFilesInDir(path.join(dir, file.name))
        : path.join(dir, file.name)));

module.exports = getFilesInDir;
