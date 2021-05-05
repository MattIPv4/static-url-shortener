const path = require('path');

const flattenTree = (tree, transform, currentPath = '') => {
    // If no data and no subpaths, stop
    if (!Object.prototype.hasOwnProperty.call(tree, 'data') && !Object.prototype.hasOwnProperty.call(tree, 'subpaths'))
        return [];

    // Temporarily store results for this tree
    const results = [];

    // If we have data, use the flatten transform function
    if (Object.prototype.hasOwnProperty.call(tree, 'data'))
        results.push(transform(currentPath, tree.data));

    // If we have subpaths, recurse over each subpath
    if (Object.prototype.hasOwnProperty.call(tree, 'subpaths'))
        for (const subpath in tree.subpaths) {
            if (!Object.prototype.hasOwnProperty.call(tree.subpaths, subpath)) continue;
            Array.prototype.push.apply(results, flattenTree(
                tree.subpaths[subpath],
                transform,
                path.join(currentPath, subpath),
            ));
        }

    // Done, flattened!
    return results;
};

module.exports = flattenTree;
