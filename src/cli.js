#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const parsing = require('./parsing');
const generation = require('./generation');
const copyAllFiles = require('./utilities/copyAllFiles');

/**
 * Generate the static HTML redirect files from a source data directory
 * @param {string} dataDir Location of data directory from the current working directory
 * @param {string} outDir Location of output directory from the current working directory
 * @param {string} [staticDir] Optional, location of static files directory from the current working directory
 * @return {Promise<void>}
 */
const generate = async (dataDir, outDir, staticDir) => {
    // Load in our data and get a redirect tree
    const tree = await parsing(path.resolve(process.cwd(), dataDir));

    // Perform the generation
    await generation(path.resolve(process.cwd(), outDir), tree);

    // Copy static assets
    if (staticDir) await copyAllFiles(path.resolve(process.cwd(), staticDir), path.resolve(process.cwd(), outDir));
};

// Create our CLI with yargs
const cli = yargs
    .scriptName('static-url-shortener')

    // Define the main command for generating the redirects
    .command('generate', 'Generate static redirect HTML files',
            cmd => cmd
                .option('d', {
                    alias: 'data',
                    default: 'data',
                    describe: 'Source directory for redirect data',
                    type: 'string'
                })
                .option('o', {
                    alias: 'out',
                    default: 'out',
                    describe: 'Output directory for HTML files',
                    type: 'string'
                })
                .option('s', {
                    alias: 'static',
                    describe: 'Optional, source directory for static files',
                    type: 'string'
                }),
            argv => generate(argv.data, argv.out, argv.static))

    // Provide help option for everything
    .help()

    // Run!
    .argv
