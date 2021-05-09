const sqlString = require('sqlstring');
const flattenTree = require('../utilities/flattenTree');

const createTable = `-- Create the redirects table
CREATE TABLE IF NOT EXISTS redirects (
    path VARCHAR(2048) NOT NULL,
    target VARCHAR(2048) NOT NULL,
    extended BOOL NOT NULL
);`;

/**
 * Convert a redirect tree to a set of SQL insert statements and a create table statement
 * @param {RedirectTree} tree The redirect tree to convert to SQL inserts
 * @return {string}
 */
module.exports = tree => {
    /**
     * Transform each data node, returning an SQL insert command
     * @param {string} currentPath The short URL path for this node
     * @param {RedirectData} data The redirect data for this node
     * @return {string}
     */
    const transform = (currentPath, data) => {
        // Convert the data object to an array of key-value sub-arrays
        const entries = Object.entries({
            path: currentPath,
            ...data,
        });

        // Get the raw column names
        const cols = entries.map(([ key ]) => key).join(', ');

        // Get the placeholders for the prepared statement values
        const vals = entries.map(() => '?').join(', ');

        // Format and return the insert statement with the escaped values
        return sqlString.format(
            `INSERT INTO redirects (${cols}) VALUES (${vals});`,
            entries.map(([ , value ]) => value),
        );
    };

    // Get the flattened tree with a string SQL insert for each redirect
    const data = flattenTree(tree, transform);

    // Return the inserts with the create table instruction
    return `${createTable}\n\n-- Insert all the redirects\n${data.join('\n')}`;
};
