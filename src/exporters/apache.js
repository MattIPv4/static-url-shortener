const flattenTree = require('../utilities/flattenTree');
const regexRoute = require('../utilities/regexRoute');

/**
 * Convert a redirect tree to a set of Apache RedirectMatch rules
 * @param {RedirectTree} tree The redirect tree to convert to Apache redirects
 * @return {string}
 */
module.exports = tree => {
    /**
     * Transform each data node, returning an Apache RedirectMatch rules
     * @param {string} currentPath The short URL path for this node
     * @param {RedirectData} data The redirect data for this node
     * @return {string}
     */
    const transform = (currentPath, data) => {
        // Get the regex pattern for the node
        const regex = regexRoute(currentPath, data);

        // Return the rewrite with the extended routing group if needed
        return `RedirectMatch ${regex} ${data.target}${data.extended ? '$1' : ''}`;
    };

    // Return flattened tree with an Apache RedirectMatch rule for each redirect
    return flattenTree(tree, transform).join('\n');
};
