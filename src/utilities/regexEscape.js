/**
 * Escape all RegEx special characters in a string
 * @param {string} str String to escape
 * @return {string}
 */
module.exports = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
