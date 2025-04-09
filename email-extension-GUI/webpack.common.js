'use strict';

const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    content: './src/js/content.js',
    popup: './src/js/popup.js',
    pageWorld: '@inboxsdk/core/pageWorld.js',
    background: '@inboxsdk/core/background.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "static" },
        { from: "src/popup.html" },
        { from: "src/styles/popup.css" }
      ],
    }),
    new Dotenv()
  ],
};
