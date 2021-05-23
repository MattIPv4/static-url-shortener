/**
 * Ensure that a given property in an object resolves to a string.
 * Supports a raw string, a function that returns a string, or a function that returns a Promise for a string.
 * @param {Object} object The object to find the property in
 * @param {string} property The property name to resolve the value of to a string
 * @return {Promise<string>}
 */
const resolveString = async (object, property) => {
    // Validate we have a string or function for the property
    if (typeof object[property] !== 'string' && typeof object[property] !== 'function')
        throw new Error(`Expected ${property} property to be either string or function`);

    // Execute function and await any promise returned
    const string = typeof object[property] === 'string' ? object[property] : await object[property]();
    if (typeof string !== 'string')
        throw new Error(`Expected ${property} property function to return a string`);

    // Return the resolved string
    return string;
};

/**
 * Validate any given raw data input and return the redirect data if valid
 * @param {*} raw The raw data to validate as redirect data
 * @return {Promise<RedirectData>}
 */
module.exports = async raw => {
    // Validate that we have an object in the file
    if (typeof raw !== 'object' || raw === null)
        throw new Error('Expected data exported in file to be an object');

    // Clone the properties we expect
    const data = {
        target: raw.target,
        extended: raw.extended,
        title: raw.title,
        description: raw.description,
        icon: raw.icon,
        banner: raw.banner,
        color: raw.color,
    };

    // Validate we have the required property
    if (!Object.prototype.hasOwnProperty.call(data, 'target'))
        throw new Error('Expected data exported in file to include a target property');

    // Ensure that target is a string
    data.target = await resolveString(data, 'target');

    // Validate that the extended flag is a boolean or not provided
    if (typeof data.extended !== 'boolean' && typeof data.extended !== 'undefined')
        throw new Error('Expected extended property to be either boolean or not defined');

    // Ensure extended is a boolean
    data.extended = data.extended === undefined ? true : data.extended;

    // Ensure that title is a string, if provided
    if (typeof data.title !== 'undefined')
        data.title = await resolveString(data, 'title');

    // Ensure that description is a string, if provided
    if (typeof data.description !== 'undefined')
        data.description = await resolveString(data, 'description');

    // Ensure that icon is a string, if provided
    if (typeof data.icon !== 'undefined')
        data.icon = await resolveString(data, 'icon');

    // Ensure that banner is a string, if provided
    if (typeof data.banner !== 'undefined')
        data.banner = await resolveString(data, 'banner');

    // Ensure that color is a string, if provided
    if (typeof data.color !== 'undefined')
        data.color = await resolveString(data, 'color');

    // Return the validated data
    return data;
};
