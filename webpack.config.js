const path = require('path');
const ShebangPlugin = require('webpack-shebang-plugin');

module.exports = {
    entry: './src/cli.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new ShebangPlugin()
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'nettime.js',
        path: path.resolve(__dirname, 'dist'),
    },
    target: 'node',
};
