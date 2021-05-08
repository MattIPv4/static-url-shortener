const flattenTree = require('../utilities/flattenTree');

/**
 * Convert a redirect tree to a JSON object
 * @param {RedirectTree} tree The redirect tree to convert to a JSON object
 * @return {string}
 */
module.exports = tree => {
    /**
     * Transform each data node, returning the node data alongside the path
     * @param {string} currentPath The short URL path for this node
     * @param {RedirectData} data The redirect data for this node
     * @return {{data: RedirectData, path: string}}
     */
    const transform = (currentPath, data) => ({
        path: currentPath,
        data,
    });

    // Get the flattened tree with an object for each redirect
    const array = flattenTree(tree, transform);

    // Transform array into object with keys for paths
    const data = array.reduce((obj, node) => ({ ...obj, [node.path]: node.data }), {});

    // Return the JSON string-ified data
    return JSON.stringify(data, null, 2);
};
