const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const yaml = require('js-yaml');

/** @type {import('webpack').Configuration} */
module.exports = {
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : 'source-map',
  entry: path.join(__dirname, 'src', 'index.jsx'),
  output: {
    clean: true,
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [new HtmlWebpackPlugin()],
  devServer: {
    port: 4000
  }
};
