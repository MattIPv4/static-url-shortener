const path = require('path');

/**
 * Flatten a redirect tree with post-order traversal, applying the transform function to each node with data
 * @param {RedirectTree} tree The redirect tree to flatten
 * @param {function(string, RedirectData): *} transform The transform function to apply to any nodes with data, taking the current path and the node data
 * @param {string} [currentPath=''] The current path for the tree being traversed, defaulting to a blank string for the root tree
 * @return {*[]}
 */
const flattenTree = (tree, transform, currentPath = '') => {
    // If no data and no subpaths, stop
    if (!Object.prototype.hasOwnProperty.call(tree, 'data') && !Object.prototype.hasOwnProperty.call(tree, 'subpaths'))
        return [];

    // Store results for this tree
    const results = [];

    // Post order traversal, so process the subpaths first
    if (Object.prototype.hasOwnProperty.call(tree, 'subpaths'))
        for (const subpath in tree.subpaths) {
            if (!Object.prototype.hasOwnProperty.call(tree.subpaths, subpath)) continue;

            // Recurse over the subpath tree and extend our results with the recursion results
            Array.prototype.push.apply(results, flattenTree(
                tree.subpaths[subpath],
                transform,
                path.join(currentPath, subpath),
            ));
        }

    // If we have data, use the flatten transform function
    if (Object.prototype.hasOwnProperty.call(tree, 'data'))
        results.push(transform(currentPath, tree.data));

    // Done, flattened!
    return results;
};

module.exports = flattenTree;
