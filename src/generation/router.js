/**
 * Find a redirect target for a given set of path segment in the redirect tree
 * @param {string[]} segments The path segments to find a matching redirect for
 * @param {RedirectTree} tree The redirect tree to find a matching redirect in
 * @return {?string}
 */
const getTarget = (segments, tree) => {
    // If there are still more segments and the next segment is a valid subpath, explore it
    if (segments.length
        && Object.prototype.hasOwnProperty.call(tree, 'subpaths')
        && Object.prototype.hasOwnProperty.call(tree.subpaths, segments[0])) {
        const subpathResult = getTarget(segments.slice(1), tree.subpaths[segments[0]]);

        // If we found a valid subpath, use it
        if (subpathResult !== null) return subpathResult;
    }

    // If this tree node has no target, backtrack
    if (!Object.prototype.hasOwnProperty.call(tree, 'data')) return null;

    // If we have extra segments and this tree node has extended routing off, backtrack
    if (segments.length && !tree.data.extended) return null;

    // Rejoin any extra segments for extended routing
    const extended = segments.join('/');

    // Return the target with any extended segments added on
    const base = tree.data.target;
    return base + (extended.length ? (base[base - 1] === '/' ? '' : '/') + extended : '');
};

/**
 * Find a redirect target for a given path in the redirect tree
 * @param {string} path The path to find a matching redirect for
 * @param {RedirectTree} tree The redirect tree to find a matching redirect in
 * @return {?string}
 */
module.exports = (path, tree) => {
    // Break the path down into segments, dropping leading & trailing slashes
    const segments = path.replace(/^\//g, '').replace(/\/$/g, '').toLowerCase().split('/');

    // Attempt to find the best possible target, considering extended routing
    return getTarget(segments, tree);
};
