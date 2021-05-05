const flattenTree = require('../utilities/flattenTree');

module.exports = tree => {
    // Define the transform that will be applied to each node's data
    const transform = (currentPath, data) => ({
        path: currentPath,
        ...data,
    });

    // Get the flattened tree with an object for each redirect
    const data = flattenTree(tree, transform);

    // Return the JSON string-ified data
    return JSON.stringify(data, null, 2);
};
