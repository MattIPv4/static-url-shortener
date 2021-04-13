/**
 * Validate any given raw data input and return the redirect target if valid data
 * @param {*} raw The raw data to validate as redirect data
 * @return {Promise<string>}
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

    return target;
};
