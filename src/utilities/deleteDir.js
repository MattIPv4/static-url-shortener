const fs = require('fs');
const path = require('path');

/**
 * Delete a directory, including all files and subdirectories
 * @param {string} dir The base directory to delete
 * @return {void}
 */
const deleteDir = dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir, { withFileTypes: true })
            .flatMap(file => file.isDirectory()
                ? deleteDir(path.join(dir, file.name))
                : fs.unlinkSync(path.join(dir, file.name)));
        fs.rmdirSync(dir);
    }
};

module.exports = deleteDir;
