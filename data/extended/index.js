module.exports = {
    target: 'https://example.com/abc/yep',
    extended: true,
    title: 'Extended wow',
    /**
     * Generate a description for testing
     * @return {string}
     */
    description: () => 'This is a redirect with extended routing',
};
