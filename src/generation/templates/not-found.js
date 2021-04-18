/* eslint-env browser, node */
/* global REDIRECT_TREE */

(() => {
    // Execute the router with the current path
    const router = require('../router')(window.location.pathname, JSON.parse(REDIRECT_TREE));

    // Handle 404, abort
    if (router === null) {
        document.body.getElementsByTagName('h1')[0].textContent = '404: URL not found';
        return;
    }

    // Set the fallback html link
    const a = document.createElement('a');
    a.textContent = 'Click here if you are not redirected.';
    a.rel = 'noreferrer';
    a.href = router;
    document.body.appendChild(a);

    // Redirect
    window.location = router;
})();
