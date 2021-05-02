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

    // Define the GitHub Actions commands
    .command('github', 'Commands for integration with GitHub Actions',
        cmd => cmd
            // Require a sub-command, this is just a group
            .demandCommand(1, 'You must provide a sub-command to use')

            // Define the PR validation subcommand
            .command('pull-request', 'Generate static redirect HTML files',
                subCmd => subCmd
                    .option('t', {
                        alias: 'token',
                        describe: 'Access token for authenticating with GitHub\'s API',
                        type: 'string'
                    })
                    .option('r', {
                        alias: 'repository',
                        describe: 'Full repository name on GitHub, owner & name',
                        type: 'string'
                    })
                    .option('n', {
                        alias: 'number',
                        describe: 'Number of the pull request to validate',
                        type: 'number'
                    })
                    .demandOption(['t', 'r', 'n']),
                argv => require('./github/pull-request')(argv.token, argv.repository, argv.number)),
        () => {})

    // Provide help option for everything
    .help()

    // Run!
    .argv
