const path = require('path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const redirect = require('../generation/redirect');

/**
 * Convert a redirect tree to a Cloudflare Workers script
 * @param {RedirectTree} tree The redirect tree to convert for Cloudflare Workers
 * @return {Promise<string>}
 */
module.exports = tree => new Promise((resolve, reject) => {
    const compiler = webpack({
        context: __dirname,
        entry: path.join(__dirname, 'cloudflare-workers', 'worker.js'),
        output: {
            path: '/',
            filename: 'worker.js',
        },
        plugins: [
            // Ensure we only ever have a single chunk
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
            // Pass in the redirect tree and template for the router
            new webpack.DefinePlugin({
                REDIRECT_TREE: JSON.stringify(tree),
                REDIRECT_TEMPLATE: redirect.load(),
            }),
        ],
    });

    // Bind to in-memory FS for output
    const fs = createFsFromVolume(new Volume());
    compiler.outputFileSystem = fs;

    // Run webpack
    compiler.run((err, stats) => {
        // Handle webpack error
        if (err) return reject(err);

        // Handle stats error
        if (stats.hasErrors()) {
            const info = stats.toJson();
            return reject(info.errors);
        }

        // Get the content of the bundled worker from the in-memory FS
        resolve(fs.readFileSync('/worker.js', 'utf8'));
    });
});
