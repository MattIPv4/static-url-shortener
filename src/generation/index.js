const fs = require('fs');
const path = require('path');
const deleteDir = require('../utilities/deleteDir');
const redirect = require('./redirect');

/**
 * Perform redirect generation for a given {@link RedirectTree}
 * @param {string} out The base full output directory path for the redirect tree
 * @param {RedirectTree} tree The redirect tree structure to generate redirects for
 */
const handleTree = (out, tree) => {
    // If no data and no subpaths, stop
    if (!Object.prototype.hasOwnProperty.call(tree, 'data') && !Object.prototype.hasOwnProperty.call(tree, 'subpaths'))
        return;

    // We have either data or subpaths, so we need to create the directory
    if (!fs.existsSync(out)) fs.mkdirSync(out);

    // If we have data, output a redirect file
    if (Object.prototype.hasOwnProperty.call(tree, 'data'))
        redirect(out, tree.data);

    // If we have subpaths, recurse over each subpath
    if (Object.prototype.hasOwnProperty.call(tree, 'subpaths'))
        for (const subpath in tree.subpaths) {
            if (!Object.prototype.hasOwnProperty.call(tree.subpaths, subpath)) continue;
            handleTree(path.join(out, subpath), tree.subpaths[subpath]);
        }
};

/**
 * Perform redirect generation for a given {@link RedirectTree}
 * @param {string} out The full output directory path for the redirect tree (will be cleaned)
 * @param {RedirectTree} tree The redirect tree to generate redirects for
 */
module.exports = (out, tree) => {
    // Clean the output directory
    deleteDir(out);

    // Start generating recursively
    handleTree(out, tree);
};
