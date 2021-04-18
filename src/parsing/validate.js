/**
 * Validate any given raw data input and return the redirect data if valid
 * @param {*} raw The raw data to validate as redirect data
 * @return {Promise<RedirectData>}
 */
module.exports = async raw => {
    // Validate that we have an object in the file
    if (typeof raw !== 'object' || raw === null)
        throw new Error('Expected data exported in file to be an object');

    // Validate we have the required property
    if (!Object.prototype.hasOwnProperty.call(raw, 'target'))
        throw new Error('Expected data exported in file to include a target property');

    // Validate we have a string or function for target
    if (typeof raw.target !== 'string' && typeof raw.target !== 'function')
        throw new Error('Expected target property to be either string or function');

    // Execute function and await any promise returned
    const target = typeof raw.target === 'string' ? raw.target : await raw.target();
    if (typeof target !== 'string')
        throw new Error('Expected target property function to return a string');

    // Validate that the extended flag is a boolean or not provided
    if (typeof raw.extended !== 'boolean' && typeof raw.extended !== 'undefined')
        throw new Error('Expected extended property to be either boolean or not defined');

    return { target, extended: raw.extended === undefined ? true : raw.extended };
};
