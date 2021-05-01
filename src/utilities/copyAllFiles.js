const fs = require('fs');
const path = require('path');

/**
 * Copy all files and subdirectories in a directory, creating the destination directories as required
 * @param {string} from The directory to copy files from within
 * @param {string} to The base directory to copy files into
 * @return {void}
 */
const copyAllFiles = (from, to) => {
    if (fs.existsSync(from)) {
        if (!fs.existsSync(to)) fs.mkdirSync(to);
        fs.readdirSync(from, { withFileTypes: true })
            .forEach(file => file.isDirectory()
                ? copyAllFiles(path.join(from, file.name), path.join(to, file.name))
                : fs.copyFileSync(path.join(from, file.name), path.join(to, file.name)));
    }
};

module.exports = copyAllFiles;
