/* eslint-disable import/no-commonjs */
const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';

const productionConfig = {
  mode: 'production',
  devtool: 'source-map',
  plugins: [],
};
const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [],
  watch: true,
};

const baseConfig = {
  entry: [path.resolve(__dirname, 'src/script.js')],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'script.js',
    library: 'script',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: { loader: 'babel-loader' },
      },
    ],
  },
};

const webpackConfig = {
  ...baseConfig,
  ...(isProduction ? productionConfig : developmentConfig),
};

module.exports = webpackConfig;
