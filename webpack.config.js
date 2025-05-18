const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'quickstart.js'
  },
  externals: [nodeExternals()],
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: '.', to: '.', globOptions: {
          ignore: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.git/**',
            '**/*.log',
            '**/webpack.config.js',
            '**/package-lock.json',
            '**/app.js'
          ]
        }}
      ],
    }),
  ],
};
