const path = require('path');

module.exports = {
  cache: true,
  entry: {
    page: './src/index.js'
  },
  devtool: 'sourcemap',
  resolve:
  {
    modules: [
      'node_modules'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
      rules: [
        {
          test: /(\.js|\.jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        { test: /\.css$/, use: ['style-loader','css-loader'] },
        { test: /\.woff2?$/, loader: 'url-loader?prefix=font/' },
        { test: /\.ttf$/, loader: 'url-loader?prefix=font/' },
        { test: /\.eot$/, loader: 'url-loader?prefix=font/' },
        { test: /\.svg$/, loader: 'url-loader?prefix=font/' },
        { test: /\.png$/, loader: 'url-loader?prefix=images/' },
        { test: /\.gif$/, loader: 'url-loader?prefix=images/' },
        { test: /\.jpg$/, loader: 'url-loader?prefix=images/' },
        { test: /\.ico$/, loader: 'url-loader?prefix=images/' },
        { test: /\.html$/, loader: 'html-loader' },
        { test: /\.cur$/, loader: 'file-loader' },
      ]
  },
  node: {
   fs: 'empty',
   ws: 'empty'
 }
};
