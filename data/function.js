module.exports = {
    /**
     * Generate a random redirect target for testing
     * @return {string}
     */
    target() {
        const randInt = Math.floor(Math.random() * 1000);
        return `https://example.com/abc/${randInt}`;
    },
};
