const path = require('path');
const getAllFiles = require('../utilities/getAllFiles');

/**
 * @typedef {Object} RedirectTree
 * @property {Object} [data] The redirect target data for this node
 * @property {Object.<string, RedirectTree>} [subpaths] The redirect tree nodes after this path segment
 */

/**
 * Get the path segments for a given redirect data file
 * @param {string} base The full base path for all redirect data
 * @param {string} file The full path to the redirect data file to parse
 * @return {string[]}
 */
const fileSegments = (base, file) => {
    // Remove the base directory, remove the JavaScript file ext
    const cleanFile = path.relative(base, file).replace(/\.js$/, '');

    // Split the file into path segments
    const segments = cleanFile.split(path.sep).map(segment => segment.toLowerCase());

    // Remove index if last segment
    if (segments.length && segments[segments.length - 1] === 'index') segments.pop();

    return segments;
};

/**
 * Parse a given redirect data file and insert it into the redirect tree
 * @param {string} base The full base path for all redirect data
 * @param {string} file The full path to the redirect data file to parse
 * @param {RedirectTree} tree The top-level redirect tree data structure
 */
const parseFile = (base, file, tree) => {
    // TODO: Load in file

    // TODO: Validate expected properties

    const pathSegments = fileSegments(base, file);
    console.log(pathSegments);

    // TODO: Find/create tree node

    // TODO: Check for tree collisions

    // TODO: Insert data into tree
};

/**
 * Load all redirect data files from a path and generate a redirect tree
 * @param {string} path The full base path for all redirect data
 * @return {RedirectTree}
 */
const generateTree = path => {
    // Fetch all the files in the given path and filter down to JavaScript files
    const files = getAllFiles(path).filter(file => file.endsWith('.js'));

    // Create our empty top-level object that will act as the tree
    const tree = {};

    // Loop through all the files and parse them
    // We're using an object for tree, so it's passed by reference and we can mutate it directly
    for (const file of files) {
        parseFile(path, file, tree);
    }

    return tree;
};

// Run for testing
generateTree(path.join(__dirname, '..', '..', 'data'));
