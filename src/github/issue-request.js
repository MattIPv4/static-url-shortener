const crypto = require('crypto');
const fetch = require('node-fetch');
const { success, error } = require('../utilities/logging');

const main = async (token, repository, issue, sha) => {
    // Fetch the full issue information
    const resp = await fetch(`https://api.github.com/repos/${repository}/issues/${issue}`, {
        headers: {
            Authorization: `token ${token}`,
        },
    });

    // Check OK response
    if (resp.status !== 200) throw Error(`Received unexpected status code: ${resp.status}`);

    // Get the JSON data
    const data = await resp.json();

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
    const branchResp = await fetch(`https://api.github.com/repos/${repository}/git/ref/heads/${branchName}`, {
        headers: {
            Authorization: `token ${token}`,
        },
    });

    // If 200, the branch already exists
    if (branchResp.status === 200) {
        error('Branch already exists for short URL path in issue.');
        return process.exit(0);
    }

    // If not 404, unexpected status code
    if (branchResp.status !== 404) throw Error(`Received unexpected status code: ${branchResp.status}`);

    // Create the new branch
    const branchCreateResp = await fetch(`https://api.github.com/repos/${repository}/git/refs`, {
        method: 'POST',
        headers: {
            Authorization: `token ${token}`,
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha,
        }),
    });

    // Check OK response
    if (branchCreateResp.status !== 201) throw Error(`Received unexpected status code: ${branchCreateResp.status}`);

    // Check if the direct JS file for the short URL path exists
    const fileResp = await fetch(`https://api.github.com/repos/${repository}/contents/${cleanPath}.js?ref=${encodeURIComponent(branchName)}`, {
        headers: {
            Authorization: `token ${token}`,
        },
    });

    // Check OK response
    if (fileResp.status !== 200 && fileResp.status !== 404)
        throw Error(`Received unexpected status code: ${fileResp.status}`);

    // Create (or update) the redirect source data file
    const fileName = fileResp.status === 200 ? `${cleanPath}.js` : `${cleanPath}/index.js`;
    const fileContent = `module.exports = {\n    target: ${JSON.stringify(bodyMatch[2].trim())},\n};`;
    const fileCreateResp = await fetch(`https://api.github.com/repos/${repository}/contents/${fileName}`, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            message: `Add short URL '/${cleanPath}' with target '${bodyMatch[2].trim()}'`,
            content: Buffer.from(fileContent).toString('base64'),
            sha: crypto.createHash('sha1').update(fileContent).digest('hex'),
            branch: branchName,
        }),
    });

    // Check OK response
    if (fileCreateResp.status !== 200 && fileCreateResp.status !== 201)
        throw Error(`Received unexpected status code: ${fileCreateResp.status}`);

    console.log(await fileCreateResp.text());
};

main(process.env.GITHUB_TOKEN, process.env.REPOSITORY, Number(process.env.ISSUE), process.env.SHA)
    .catch(err => {
        error(`An unexpected error occurred during the issue processing\n  ${err.toString().replace(/\n/g, '\n  ')}`);
        process.exit(1);
    });
