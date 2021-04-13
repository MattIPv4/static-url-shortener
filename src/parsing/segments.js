const path = require('path');

/**
 * Get the path segments for a given redirect data file
 * @param {string} base The full base path for all redirect data
 * @param {string} file The full path to the redirect data file to parse
 * @return {string[]}
 */
module.exports = (base, file) => {
    // Remove the base directory, remove the JavaScript file ext
    const cleanFile = path.relative(base, file).replace(/\.js$/, '');

    // Split the file into path segments
    const segments = cleanFile.split(path.sep).map(segment => segment.toLowerCase());

    // Remove index if last segment
    if (segments.length && segments[segments.length - 1] === 'index') segments.pop();

    return segments;
};
