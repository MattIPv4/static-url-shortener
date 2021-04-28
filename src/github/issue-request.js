const crypto = require('crypto');
const fetch = require('node-fetch');
const jsesc = require('jsesc');
const { success, error } = require('../utilities/logging');

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

const getIssue = async (token, repository, issue) => await githubAPI(token, `repos/${repository}/issues/${issue}`);

const getBranch = async (token, repository, branch) => await githubAPI(token, `repos/${repository}/branches/${branch}`);

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

const getRepository = async (token, repository) => await githubAPI(token, `repos/${repository}`);

const getDefaultBranchName = async (token, repository) => {
    // Get the JSON data
    const data = await getRepository(token, repository);

    // Return the default branch
    return data.default_branch;
};

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

const getFile = async (token, repository, file, branch) =>
    await githubAPI(token, `repos/${repository}/contents/${file}?ref=${encodeURIComponent(branch)}`);

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

const createPullRequest = async (token, repository, title, head, base, body) => await githubAPI(
    token,
    `repos/${repository}/pulls`,
    'POST',
    {
        'Content-type': 'application/json',
    },
    JSON.stringify({
        title,
        head,
        base,
        body,
    }),
);

const main = async (token, repository, issue) => {
    // Fetch the full issue information
    const data = await getIssue(token, repository, issue);

    // Only process issues that are open
    if (data.state !== 'open') {
        error('Issue is not currently open.');
        return process.exit(0);
    }

    // Only process issues from users with write permissions
    if (!['OWNER', 'MEMBER', 'COLLABORATOR'].includes(data.author_association)) {
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

    console.log(data);
    console.log(body);

    // Check if a branch already exists for this request
    const cleanPath = bodyPath.replace(/^\//, '').replace(/\/$/, '');
    const branchName = `request/${cleanPath}`;
    if (await checkBranchExists(token, repository, branchName)) {
        error('Branch already exists for short URL path in issue.');
        return process.exit(0);
    }

    // Get the default branch for the repository
    const defaultBranch = await getDefaultBranchName(token, repository);
    const defaultBranchData = await getBranch(token, repository, defaultBranch)

    // Create the new branch
    await createBranch(token, repository, branchName, defaultBranchData.commit.sha);

    // Check if the direct JS file for the short URL path exists
    // TODO: 'data/' should be an arg
    const jsFileExists = await checkFileExists(token, repository, `data/${cleanPath}.js`, branchName);

    // Create (or update) the redirect source data file
    // TODO: 'data/' should be an arg
    await createFile(token, repository, branchName,
        `data/${jsFileExists ? `${cleanPath}.js` : `${cleanPath}/index.js`}`,
        `module.exports = ${jsesc({ target: bodyMatch[2].trim() }, { compact: false, indent: '    ' })};\n`,
        `Add short URL '/${cleanPath}' with target '${bodyMatch[2].trim()}'`);

    // Create the pull request
    await createPullRequest(token, repository, `Add short URL '/${cleanPath}'`, branchName, defaultBranch,
        `Add short URL '/${cleanPath}' with target '${bodyMatch[2].trim()}'.\nThis resolves issue request #${issue}.`);
};

main(process.env.GITHUB_TOKEN, process.env.REPOSITORY, Number(process.env.ISSUE))
    .catch(err => {
        error(`An unexpected error occurred during the issue processing\n  ${err.toString().replace(/\n/g, '\n  ')}`);
        process.exit(1);
    });
