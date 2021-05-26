const fs = require('fs');
const path = require('path');
const dot = require('dot');

/**
 * Load the doT template for the redirect HTML file
 * @return {TemplateFunction}
 */
module.exports.load = () => dot.template(
    fs.readFileSync(path.join(__dirname, 'templates', 'redirect.html'), 'utf8'),
    { argName: 'data' },
);

/**
 * Generate an index.html redirect file for the given redirect data
 * @param {TemplateFunction} template The redirect HTML generation template function
 * @param {RedirectData} data The redirect data to use for this redirect output
 * @param {string} out The full output directory path for the redirect data
 */
module.exports.output = (template, data, out) => {
    // Generate HTML for this redirect from the template
    const result = template(data);

    // Write to index.html in the base directory
    fs.writeFileSync(path.join(out, 'index.html'), result);
};
