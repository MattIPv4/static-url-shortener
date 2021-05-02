const crypto = require('crypto');
const fetch = require('node-fetch');
const stringifyObject = require('stringify-object');
const { success, error } = require('../utilities/logging');

/**
 * Make a request to the GitHub API
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} path Endpoint path for the request, without a leading slash
 * @param {string} [method='GET'] HTTP request method for the request, defaulting to GET
 * @param {Object.<string, string>} [headers={}] Any headers for the HTTP request
 * @param {string} [body] Any stringified body payload to include in the request
 * @return {Promise<*>}
 */
const githubAPI = async (token, path, method = 'GET', headers = {}, body = undefined) => {
    const resp = await fetch(`https://api.github.com/${path}`, {
        method,
        headers: {
            Authorization: `token ${token}`,
            ...headers,
        },
        body,
    });

    // Check OK response
    if (resp.status < 200 || resp.status > 299) throw Error(`Received unexpected status code: ${resp.status}`);

    // Get the JSON data
    return await resp.json();
};

/**
 * Fetch an issue from GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {number} issue Issue number to fetch
 * @return {Promise<*>}
 */
const getIssue = async (token, repository, issue) => await githubAPI(token, `repos/${repository}/issues/${issue}`);

/**
 * Fetch a git branch from GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} branch Branch name to fetch
 * @return {Promise<*>}
 */
const getBranch = async (token, repository, branch) => await githubAPI(token, `repos/${repository}/branches/${branch}`);

/**
 * Check if a git branch exists in a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} branch Branch name to check for
 * @return {Promise<boolean>}
 */
const checkBranchExists = async (token, repository, branch) => {
    try {
        // Attempt to get the branch and return true if it was found
        await getBranch(token, repository, branch);
        return true;
    } catch (err) {
        // If the error was for it not being found, return false
        if (err.message === 'Received unexpected status code: 404') return false;

        // Otherwise, the error is a real error, re-throw it
        throw err;
    }
};

/**
 * Fetch a repository from GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @return {Promise<*>}
 */
const getRepository = async (token, repository) => await githubAPI(token, `repos/${repository}`);

/**
 * Fetch the default branch name for a repository from GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @return {Promise<*>}
 */
const getDefaultBranchName = async (token, repository) => {
    // Get the JSON data
    const data = await getRepository(token, repository);

    // Return the default branch
    return data.default_branch;
};

/**
 * Create a new git branch for a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} branch Name of the new branch to create
 * @param {string} sha SHA1 commit hash to base the branch on
 * @return {Promise<*>}
 */
const createBranch = async (token, repository, branch, sha) => await githubAPI(
    token,
    `repos/${repository}/git/refs`,
    'POST',
    {
        'Content-type': 'application/json',
    },
    JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha,
    }),
);

/**
 * Fetch a file from a branch in a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} file Name (including path) of the file to fetch
 * @param {string} branch Branch name to fetch the file from
 * @return {Promise<*>}
 */
const getFile = async (token, repository, file, branch) =>
    await githubAPI(token, `repos/${repository}/contents/${file}?ref=${encodeURIComponent(branch)}`);

/**
 * Check if a file exists in a branch in a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} file Name (including path) of the file to check for
 * @param {string} branch Branch name to check im
 * @return {Promise<boolean>}
 */
const checkFileExists = async (token, repository, file, branch) => {
    try {
        // Attempt to get the file and return true if it was found
        await getFile(token, repository, file, branch);
        return true;
    } catch (err) {
        // If the error was for it not being found, return false
        if (err.message === 'Received unexpected status code: 404') return false;

        // Otherwise, the error is a real error, re-throw it
        throw err;
    }
};

/**
 * Create and commit a new file to a branch in a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} branch Branch name to create the file in
 * @param {string} file Name (including path) of the file to create
 * @param {string} content Contents to include in the created file
 * @param {string} message Commit message to use for creating the file
 * @return {Promise<*>}
 */
const createFile = async (token, repository, branch, file, content, message) => await githubAPI(
    token,
    `repos/${repository}/contents/${file}`,
    'PUT',
    {
        'Content-type': 'application/json',
    },
    JSON.stringify({
        branch,
        message,
        content: Buffer.from(content).toString('base64'),
        sha: crypto.createHash('sha1').update(content).digest('hex'),
    }),
);

/**
 * Create a pull request for a head branch against a base branch in a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {string} head Branch name for the head branch (the branch to be merged)
 * @param {string} base Branch name for the base branch (the branch being merged into)
 * @param {string} title Title for the pull request
 * @param {string} body Body contents for the pull request
 * @return {Promise<*>}
 */
const createPullRequest = async (token, repository, head, base, title, body) => await githubAPI(
    token,
    `repos/${repository}/pulls`,
    'POST',
    {
        'Content-type': 'application/json',
    },
    JSON.stringify({
        head,
        base,
        title,
        body,
    }),
);

/**
 * Create a new comment on an issue in a repository on GitHub
 * @param {string} token Token used to authenticate the request with GitHub
 * @param {string} repository Full name of the repository, owner & repo name
 * @param {number} issue Issue number to create the comment on
 * @param {string} body Body of the comment to create
 * @return {Promise<*>}
 */
const createIssueComment = async (token, repository, issue, body) => await githubAPI(
    token,
    `repos/${repository}/issues/${issue}/comments`,
    'POST',
    {
        'Content-type': 'application/json',
    },
    JSON.stringify({
        body,
    }),
);

/**
 * Process an issue on GitHub and determine if it is valid short URL request, creating a pull request if it is
 * @param {string} token API token that will be used to authenticate with the GitHub API
 * @param {string} repository The full name of the repository on GitHub where the issue was created
 * @param {number} issue The number for the issue in the GitHub repository
 * @return {Promise<void>}
 */
module.exports = async (token, repository, issue) => {
    // Fetch the full issue information
    const data = await getIssue(token, repository, issue);

    // Only process issues that are open
    if (data.state !== 'open') {
        error('Issue is not currently open.');
        return process.exit(0);
    }

    // Only process issues from users with write permissions
    if (![ 'OWNER', 'MEMBER', 'COLLABORATOR' ].includes(data.author_association)) {
        error('Issue author does not have write permissions.');
        return process.exit(0);
    }

    // Check if the title matches the format
    const titleMatch = data.title.trim().match(/^Redirect request: ?(.+)$/);

    // If the title does not match, show an error message but exit cleanly
    if (titleMatch === null) {
        error('Issue title does not match redirect request template format.');
        return process.exit(0);
    }

    // Get cleaned body
    const body = data.body
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\r\n/g, '\n') // Clean carriage returns
        .replace(/\n{2,}/g, '\n') // Reduce multiple linebreaks to single
        .trim(); // Remove leading/trailing whitespace

    // Attempt to match on our expected template
    const bodyMatch = body.match(/^\*\*Short URL path:\*\* ?(.+)\n\*\*Target URL:\*\* ?(.+)$/);

    // If the body does not match, show an error message but exit cleanly
    if (bodyMatch === null) {
        error('Issue body does not match redirect request template format.');
        return process.exit(0);
    }

    // Check the title matches the requested short path
    const titlePath = titleMatch[1].toLowerCase().trim();
    const bodyPath = bodyMatch[1].toLowerCase().trim();
    if (titlePath !== bodyPath) {
        error('Short URL path in issue title does not match short URL path in issue body.');
        return process.exit(0);
    }

    // Check if a branch already exists for this request
    const cleanPath = bodyPath.replace(/^\//, '').replace(/\/$/, '');
    const branchName = `request/${cleanPath}`;
    if (await checkBranchExists(token, repository, branchName)) {
        error('Branch already exists for short URL path in issue.');
        return process.exit(0);
    }

    // Get the default branch for the repository
    const defaultBranch = await getDefaultBranchName(token, repository);
    const defaultBranchData = await getBranch(token, repository, defaultBranch);

    // Create the new branch
    await createBranch(token, repository, branchName, defaultBranchData.commit.sha);

    // Check if the direct JS file for the short URL path exists
    // TODO: 'data/' should be an arg
    const jsFileExists = await checkFileExists(token, repository, `data/${cleanPath}.js`, branchName);

    // Create (or update) the redirect source data file
    // TODO: 'data/' should be an arg
    await createFile(token, repository, branchName,
        `data/${jsFileExists ? `${cleanPath}.js` : `${cleanPath}/index.js`}`,
        `module.exports = ${stringifyObject({ target: bodyMatch[2].trim() }, { indent: '    ' })};\n`,
        `Add short URL '/${cleanPath}' with target '${bodyMatch[2].trim()}'`);

    // Create the pull request
    const pullRequest = await createPullRequest(token, repository, branchName, defaultBranch,
        `Add short URL '/${cleanPath}'`,
        `Add short URL '/${cleanPath}' with target '${bodyMatch[2].trim()}'.\nThis resolves issue request #${issue}.`);

    // Leave a comment on the issue
    await createIssueComment(token, repository, issue,
        `✅ A pull request has been created for this short URL request: #${pullRequest.number}`);

    // Done!
    success(`Issue processed successfully and pull request created: ${pullRequest.html_url}`);
};
