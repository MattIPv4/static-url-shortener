/**
 * Log a success message to the console
 * @param {string} msg The success message to log
 * @param {number} [linesBefore=0] Number of linebreaks to insert before the message
 * @return {void}
 */
const success = (msg, linesBefore = 0) => console.log(`${'\n'.repeat(linesBefore)}✔ ${msg}`);

/**
 * Log an error message to the console
 * @param {string} msg The error message to log
 * @param {number} [linesBefore=1] Number of linebreaks to insert before the message
 * @return {void}
 */
const error = (msg, linesBefore = 1) => console.error(`${'\n'.repeat(linesBefore)}✗ ${msg}`);

module.exports = { success, error };
