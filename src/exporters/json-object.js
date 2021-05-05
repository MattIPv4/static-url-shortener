const flattenTree = require('../utilities/flattenTree');

module.exports = tree => {
    // Define the transform that will be applied to each node's data
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
