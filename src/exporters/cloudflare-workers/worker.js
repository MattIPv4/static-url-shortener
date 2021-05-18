/* eslint-env browser, node */
/* global REDIRECT_TREE */

const router = require('../../generation/router');

/**
 * Handle an incoming request to the Worker, attempt to resolve a target redirect
 * @param {Request} request Incoming request
 * @return {Response}
 */
const handleRequest = request => {
    // Parse the request URL
    const url = new URL(request.url);

    // Attempt to find a target from the redirect tree
    const target = router(url.pathname, REDIRECT_TREE);

    // If no target, pass through
    if (target === null) return fetch(request);

    // Return the redirect to the target
    return Response.redirect(target, 302);
};

// Bind the listener for requests
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));
