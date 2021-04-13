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
const parseFile = async (base, file, tree) => {
    // Load in the file
    const raw = require(file);

    // Validate that we have an object in the file
    if (typeof raw !== 'object' || raw === null)
        throw new Error('Expected data exported in file to be an object');

    // Validate we have the required property
    if (!Object.prototype.hasOwnProperty.call(raw, 'target'))
        throw new Error('Expected data exported in file to include a target property');

    // Validate we have a string or function for target
    if (typeof raw.target !== 'string' && typeof raw.target !== 'function')
        throw new Error('Expected target property to be either string or function');

    // Execute function and await any promise returned
    const target = typeof raw.target === 'string' ? raw.target : await raw.target();
    if (typeof target !== 'string')
        throw new Error('Expected target property function to return a string');

    // Get the path segments from the file name
    const pathSegments = fileSegments(base, file);

    // Find the current tree node for this redirect
    let node = tree;
    for (const segment of pathSegments) {
        // If the current node doesn't have subpaths, create it
        if (!node.subpaths) node.subpaths = {};

        // If the current node doesn't have the next segment, add it
        if (!Object.prototype.hasOwnProperty.call(node.subpaths, segment)) node.subpaths[segment] = {};

        // Move down the tree to the next path segment node
        node = node.subpaths[segment];
    }

    // If there is already data, we have a clash
    if (Object.prototype.hasOwnProperty.call(node, 'data'))
        throw new Error(`Redirect data already defined for path /${pathSegments.join('/')}`);

    // Insert data into tree (this mutates the passed in tree)
    node.data = {
        target,
    };
};

/**
 * Load all redirect data files from a path and generate a redirect tree
 * @param {string} path The full base path for all redirect data
 * @return {Promise<RedirectTree>}
 */
const generateTree = async path => {
    // Fetch all the files in the given path and filter down to JavaScript files
    const files = getAllFiles(path).filter(file => file.endsWith('.js'));

    // Create our empty top-level object that will act as the tree
    const tree = {};

    // Loop through all the files and parse them
    // We're using an object for tree, so it's passed by reference and we can mutate it directly
    for (const file of files) {
        try {
            await parseFile(path, file, tree);
        } catch (err) {
            console.error(`Failed to load redirect data from ${file}`);
            console.error(err);
        }
    }

    return tree;
};

// Run for testing
generateTree(path.join(__dirname, '..', '..', 'data')).then(tree => console.log(JSON.stringify(tree, null, 2)));
