const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const expressions = require('posthtml-expressions');
const htmlnano = require('htmlnano');

// Load the template
const template = fs.readFileSync(path.join(__dirname, 'templates', 'redirect.html'), 'utf8');

/**
 * Generate an index.html redirect file for the given redirect data
 * @param {string} out The full output directory path for the redirect data
 * @param {RedirectData} data The redirect data to use for this redirect output
 * @return {Promise<void>}
 */
module.exports = async (out, data) => {
    // Use PostHTML to generate the HTML from the template
    const result = await posthtml([ expressions({ locals: data }), htmlnano() ]).process(template);

    // Write to index.html in the base directory
    fs.writeFileSync(path.join(out, 'index.html'), result.html);
};
