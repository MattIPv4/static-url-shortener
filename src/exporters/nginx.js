const flattenTree = require('../utilities/flattenTree');

/**
 * Convert a redirect tree to a set of NGINX rewrite rules
 * @param {RedirectTree} tree The redirect tree to convert to NGINX rewrites
 * @return {string}
 */
module.exports = tree => {
    /**
     * Transform each data node, returning an NGINX rewrite rule
     * @param {string} currentPath The short URL path for this node
     * @param {RedirectData} data The redirect data for this node
     * @return {string}
     */
    const transform = (currentPath, data) => {
        // Ensure that all regex chars are escaped in the current path
        const esacpedPath = currentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Determine the start of the rewrite match, with or without a leading slash
        const base = esacpedPath ? '^/' : '^';

        // Non-extended routing has a simple redirect
        if (!data.extended) return `rewrite ${base}${esacpedPath}/?$ ${data.target} redirect;`;

        // If the target has a trailing slash, don't include it in the extended group
        const extGroup = data.target.endsWith('/') ? '(?:/(.*))' : '(/.*)';

        // Return the rewrite with extended routing support
        return `rewrite ${base}${esacpedPath}${extGroup}?$ ${data.target}$1 redirect;`;
    };

    // Return flattened tree with an NGINX rewrite for each redirect
    return flattenTree(tree, transform).join('\n');
};
