const path = require('path');

module.exports = {
    entry: './src/javascript/game.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'test')
    }
};