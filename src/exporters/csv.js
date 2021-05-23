const flattenTree = require('../utilities/flattenTree');

/**
 * Stringify a value for a CSV output, escaping quotes, commas and newlines.
 * @param {*} val Value to stringify for a CSV output
 * @return {string}
 */
const csvValue = val => `${val}`.match(/[",\n]/) !== null ? `"${`${val}`.replace(/"/g, '""')}"` : `${val}`;

/**
 * Convert a redirect tree to a CSV data string with headers
 * @param {RedirectTree} tree The redirect tree to convert to a CSV string
 * @return {string}
 */
module.exports = tree => {
    /**
     * Transform each data node, returning a CSV row of the path, target & extended flag
     * @param {string} currentPath The short URL path for this node
     * @param {RedirectData} data The redirect data for this node
     * @return {string}
     */
    const transform = (currentPath, data) => [
        currentPath,
        data.target,
        data.extended,
        data.title,
        data.description,
        data.icon,
        data.banner,
        data.color,
    ].map(val => csvValue(val)).join(',');

    // Get the flattened tree with a string CSV row for each redirect
    const data = flattenTree(tree, transform);

    // Add the header row and return
    return [ 'Path,Target,Extended,Title,Description,Icon,Banner,Color' ].concat(data).join('\n');
};
