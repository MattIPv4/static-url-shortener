const regexEscape = require('./regexEscape');

/**
 * Generate a RegEx pattern to match a given path and redirect node data
 * @param {string} currentPath The short URL path for this node
 * @param {RedirectData} data The redirect data for this node
 * @return {string}
 */
module.exports = (currentPath, data) => {
    // Ensure that all regex chars are escaped in the current path
    const escapedPath = regexEscape(currentPath);

    // Determine the start of the rewrite match, with or without a leading slash
    const base = escapedPath ? '^/' : '^';

    // Non-extended routing has simple regex
    if (!data.extended) return `${base}${escapedPath}/?$`;

    // If the target has a trailing slash, don't include it in the extended group
    const extGroup = data.target.endsWith('/') ? '(?:/(.*))' : '(/.*)';

    // Return the regex with extended routing support
    return `${base}${escapedPath}${extGroup}?$`;
};


