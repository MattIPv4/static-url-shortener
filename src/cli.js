const path = require('path');
const parsing = require('./parsing');
const generation = require('./generation');

/**
 * Not a real CLI yet, just running stuff to test
 * @return {Promise<void>}
 */
const main = async () => {
    // Load in our data and get a redirect tree
    const tree = await parsing(path.join(__dirname, '..', 'data'));
    console.log(JSON.stringify(tree, null, 2));

    // Perform the generation
    generation(path.join(__dirname, '..', 'out'), tree);
};

main().then();
