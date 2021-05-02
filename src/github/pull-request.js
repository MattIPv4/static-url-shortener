const path = require('path');
const fetch = require('node-fetch');
const validate = require('../parsing/validate');
const { success, error } = require('../utilities/logging');

/**
 * Validate files changed locally based on the diff in a GitHub pull request
 * @param {string} token API token that will be used to authenticate with the GitHub API
 * @param {string} repository The full name of the repository on GitHub where the pull requests was made
 * @param {number} pullRequest The number for the pull request in the GitHub repository
 * @return {Promise<void>}
 */
module.exports = async (token, repository, pullRequest) => {
    // Fetch the files in the PR
    // TODO: Handle pagination
    const resp = await fetch(`https://api.github.com/repos/${repository}/pulls/${pullRequest}/files`, {
        headers: {
            Authorization: `token ${token}`,
        },
    });

    // Check OK response
    if (resp.status !== 200) throw Error(`Received unexpected status code: ${resp.status}`);

    // Get the JSON data
    const allFiles = await resp.json();

    // Only care for new/modified data files
    // TODO: 'data/' should be an arg
    const dataFiles = allFiles.filter(file => (file.status === 'added' || file.status === 'modified')
        && file.filename.startsWith('data/') && file.filename.endsWith('.js'));

    // Track the results for each file for reporting
    const results = [];

    // Attempt to validate the files, logging errors but not aborting
    for (const file of dataFiles) {
        try {
            // Load in the file (script should be run from the root of the repo)
            const raw = require(path.join(process.cwd(), file.filename));

            // Validate the data (we don't need the parsed target returned)
            await validate(raw);

            // No error during validation, store success
            results.push({ file: file.filename, valid: true, err: null });
        } catch (err) {
            // Store the error found during validation
            results.push({ file: file.filename, valid: false, err });
        }
    }

    // Sort our results by success first
    results.sort((a, b) => a.valid && b.valid ? 0 : (a.valid ? -1 : 1));

    // Log all the file results
    for (const result of results) {
        result.valid
            ? success(`${result.file} passed validation`)
            : error(`${result.file} failed validation\n  ${result.err.toString().replace(/\n/g, '\n  ')}`);
    }

    // If we had an error, exit status 1
    if (results.some(result => !result.valid)) {
        error('Not all added and modified data files passed validation');
        process.exit(1);
        return;
    }

    // We didn't have any errors, success!
    success('All added and modified data files passed validation', 1);
};
