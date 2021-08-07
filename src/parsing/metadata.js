const fetch = require('node-fetch');
const { JSDOM, VirtualConsole, ResourceLoader } = require('jsdom');

/**
 * Get a property from an element selector in the doc if it exists
 * Use the property `text` to get the text content
 * @param {Document} doc HTML DOM document to search in
 * @param {string} selector DOM selector string to search for
 * @param {string} prop Attribute/property name to get from element
 * @return {?string}
 */
const getElementProp = (doc, selector, prop) => {
    const element = doc.querySelector(selector);
    return prop === 'text'
        ? (element ? element.textContent : '')
        : (element ? element.getAttribute(prop) : null);
};

/**
 * Scrape metadata for a given redirect data file and data object
 * Hydrates and returns an updated data object with any found metadata
 * @param {string} file The full path to the redirect data file being used
 * @param {RedirectData} data The parsed data object to hydrate with scraped metadata
 * @return {RedirectData}
 */
module.exports = async (file, data) => {
    // Set a custom UA to use for all requests
    const userAgent = 'Static-URL-Shortener-Bot 1.0 (+https://github.com/MattIPv4/static-url-shortener)';

    // Attempt to fetch the target
    const res = await fetch(data.target, {
        headers: {
            'User-Agent': userAgent,
        },
        redirect: 'follow',
        follow: 10,
    });

    // If failed, log and return original
    if (!res.ok) {
        console.error(`Failed to scrape metadata for ${file}`);
        console.error(`${res.status} ${res.statusText}`);
        return data;
    }

    // Get the response as text and parse DOM
    const text = await res.text();
    const { window } = new JSDOM(text, {
        url: data.target,
        runScripts: 'dangerously',
        virtualConsole: new VirtualConsole(),
        resources: new ResourceLoader({ userAgent }),
    });

    // Allow the DOM to load for one second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get standard metadata items
    const scraped = {
        // Color
        themeColor: getElementProp(window.document, 'meta[name="theme-color"]', 'content'),
        msTileColor: getElementProp(window.document, 'meta[name="msapplication-TileColor"]', 'content'),

        // Title
        opengraphTitle: getElementProp(window.document, 'meta[property="og:title"]', 'content'),
        twitterTitle: getElementProp(window.document, 'meta[name="twitter:title"]', 'content'),
        title: getElementProp(window.document, 'title', 'text'),
        metaTitle: getElementProp(window.document, 'meta[name="title"]', 'content'),

        // Description
        opengraphDescription: getElementProp(window.document, 'meta[property="og:description"]', 'content'),
        twitterDescription: getElementProp(window.document, 'meta[name="twitter:description"]', 'content'),
        metaDescription: getElementProp(window.document, 'meta[name="description"]', 'content'),

        // Icon
        shortcutIcon: getElementProp(window.document, 'link[rel="shortcut icon"]', 'href'),
        shortcutIcon2: getElementProp(window.document, 'link[rel="shortcut-icon"]', 'href'),
        icon: getElementProp(window.document, 'link[rel="icon"]', 'href'),
        appleTouchIcon: getElementProp(window.document, 'link[rel="apple-touch-icon"]', 'href'),
        msTileImage: getElementProp(window.document, 'meta[name="msapplication-TileImage"]', 'content'),

        // Image
        opengraphImage: getElementProp(window.document, 'meta[property="og:image"]', 'content'),
        twitterImage: getElementProp(window.document, 'meta[name="twitter:image"]', 'content'),
        imageSrc: getElementProp(window.document, 'link[rel="image_src"]', 'href'),
    };

    // Close the JSDOM window
    window.close();

    // Determine the title
    const title = scraped.opengraphTitle
        || scraped.twitterTitle
        || scraped.title
        || scraped.metaTitle;

    // Determine the description
    const description = scraped.opengraphDescription
        || scraped.twitterDescription
        || scraped.metaDescription;

    // Icon
    const icon = scraped.shortcutIcon
        || scraped.shortcutIcon2
        || scraped.icon
        || scraped.appleTouchIcon
        || scraped.msTileImage;

    // Banner
    const banner = scraped.opengraphImage
        || scraped.twitterImage
        || scraped.imageSrc;

    // Color
    const color = scraped.themeColor
        || scraped.msTileColor;

    // Return the scraped data, allowing original data to overwrite
    return {
        ...data,
        title: data.title ?? title,
        description: data.description ?? description,
        icon: data.icon ?? icon,
        banner: data.banner ?? banner,
        color: data.color ?? color,
    };
};
