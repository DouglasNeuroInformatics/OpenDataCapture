import path from 'path';
import process from 'process';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : 'source-map',
  entry: path.join(__dirname, 'src', 'index.tsx'),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpeg|svg|ttf)$/,
        type: 'asset/resource',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  output: {
    clean: true,
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: path.join(__dirname, 'src', 'assets', 'favicon.png'),
      title: 'Douglas Neuroinformatics Platform',
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    allowedHosts: process.env.DEMO_MODE ? 'all' : 'auto',
    historyApiFallback: true,
    port: 3000,
    proxy: {
      '/api': 'http://backend:3000',
    },
  },
};

export default config;
