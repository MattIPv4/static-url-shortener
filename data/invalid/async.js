module.exports = {
    /**
     * Generate an invalid redirect target for testing with a delay
     * @return {Promise<string[]>}
     */
    async target() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [ 'https://example.com/abc/invalid-function' ];
    },
};
