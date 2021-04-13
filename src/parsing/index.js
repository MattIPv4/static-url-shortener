const path = require('path');
const getAllFiles = require('../utilities/getAllFiles');
const validate = require('./validate');
const segments = require('./segments');

/**
 * @typedef {Object} RedirectTree
 * @property {Object} [data] The redirect target data for this node
 * @property {Object.<string, RedirectTree>} [subpaths] The redirect tree nodes after this path segment
 */

/**
 * Parse a given redirect data file and insert it into the redirect tree
 * @param {string} base The full base path for all redirect data
 * @param {string} file The full path to the redirect data file to parse
 * @param {RedirectTree} tree The top-level redirect tree data structure
 */
const parseFile = async (base, file, tree) => {
    // Load in the file
    const raw = require(file);

    // Validate the raw data and get the target
    const target = await validate(raw);

    // Get the path segments from the file name
    const pathSegments = segments(base, file);

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
