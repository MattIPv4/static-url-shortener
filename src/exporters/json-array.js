const flattenTree = require('../utilities/flattenTree');

/**
 * @typedef {Object} RedirectDataWithPath
 * @augments RedirectData
 * @property {string} path The redirect short URL path
 */

/**
 * Convert a redirect tree to a JSON array of data objects
 * @param {RedirectTree} tree The redirect tree to convert to a JSON array
 * @return {string}
 */
module.exports = tree => {
    /**
     * Transform each data node, returning the node data combined with the path
     * @param {string} currentPath The short URL path for this node
     * @param {RedirectData} data The redirect data for this node
     * @return {RedirectDataWithPath}
     */
    const transform = (currentPath, data) => ({
        path: currentPath,
        ...data,
    });

    // Get the flattened tree with an object for each redirect
    const data = flattenTree(tree, transform);

    // Return the JSON string-ified data
    return JSON.stringify(data, null, 2);
};
