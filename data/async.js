module.exports = {
    /**
     * Generate a random redirect target with a delay for testing
     * @return {Promise<string>}
     */
    async target() {
        await new Promise(resolve => setTimeout(resolve, 500));
        const randInt = Math.floor(Math.random() * 1000);
        return `https://example.com/abc/${randInt}`;
    },
};
