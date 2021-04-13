const fs = require('fs');
const path = require('path');

// Load the template
const template = fs.readFileSync(path.join(__dirname, 'redirect.template.html'), 'utf8');

/**
 * Generate an index.html redirect file for the given redirect data
 * @param {string} out The full output directory path for the redirect data
 * @param {Object} data The redirect data to use for this redirect output
 */
module.exports = (out, data) => {
    // Make a copy of the template and substitute in our redirect target
    const redirect = template.replace(/{{ target }}/g, data.target);

    // Write to index.html in the base directory
    fs.writeFileSync(path.join(out, 'index.html'), redirect);
};
