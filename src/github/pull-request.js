const path = require('path');
const fetch = require('node-fetch');
const validate = require('../parsing/validate');

/**
 * Validate files changed locally based on the diff in a GitHub pull request
 * @param {string} token API token that will be used to authenticate with the GitHub API
 * @param {string} owner The owner of the GitHub repository in which the pull request was made
 * @param {string} repo The name of the repository on GitHub where the pull requests was made
 * @param {number} pullRequest The number for the pull request in the GitHub repository
 * @return {Promise<void>}
 */
const main = async (token, owner, repo, pullRequest) => {
    // Fetch the files in the PR
    // TODO: Handle pagination
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullRequest}/files`, {
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

    // Track if we encounter an error (so we can exit status 1 at the end)
    let hasError = false;

    // Attempt to validate the files, logging errors but not aborting
    for (const file of dataFiles) {
        try {
            // Load in the file (script should be run from the root of the repo)
            const raw = require(path.join(process.cwd(), file.filename));

            // Validate the data (we don't need the parsed target returned)
            await validate(raw);
        } catch (err) {
            // Store that there was an error
            hasError = true;

            // Log the error for the file
            console.error(`Failed to load redirect data from ${file.filename}`);
            console.error(err);
        }
    }

    // If we had an error, exit status 1
    if (hasError) throw new Error('Not all added and modified data files passed validation');
};

main(process.env.GITHUB_TOKEN, process.env.OWNER, process.env.REPO, Number(process.env.PULL_REQUEST))
    .then(() => {
        console.log('All added and modified data files passed validation')
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
