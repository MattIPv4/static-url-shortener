const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

/**
 * Generate a 404.html file with the router
 * @param {string} out The full output directory path for the 404 file
 * @param {RedirectTree} tree The redirect tree to use for the 404 router
 * @return {Promise<void>}
 */
module.exports = (out, tree) => new Promise((resolve, reject) => webpack({
    context: __dirname,
    entry: path.join(__dirname, 'templates', 'not-found.js'),
    output: {
        path: out,
        filename: '404.js',
    },
    plugins: [
        // Ensure we only ever have a single chunk (404.js)
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        // Pass in the redirect tree for the router
        new webpack.DefinePlugin({
            REDIRECT_TREE: JSON.stringify(tree),
        }),
        // Generate the HTML page with the script linked
        new HtmlWebpackPlugin({
            filename: '404.html',
            template: path.join(__dirname, 'templates', 'not-found.html'),
        }),
        // Replace the linked script with an inline version
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [ /404\.js/ ]),
    ],
}, (err, stats) => {
    // Handle webpack error
    if (err) return reject(err);

    // Handle stats error
    if (stats.hasErrors()) {
        const info = stats.toJson();
        return reject(info.errors);
    }

    // Remove the output js, we inlined it
    fs.unlinkSync(path.join(out, '404.js'));

    // Done
    resolve();
}));
