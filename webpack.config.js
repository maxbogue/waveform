/* global __dirname */

const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

const sassLoader = {
  loader: 'sass-loader',
  options: {
    implementation: require('sass'),
  },
};

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          silent: true,
        },
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]_[hash:base64:5]',
                },
              },
              sassLoader,
            ],
          },
          {
            use: ['vue-style-loader', 'css-loader', sassLoader],
          },
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=100000',
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': path.join(__dirname, 'src'),
    },
  },
  devtool: 'source-map',
  performance: {
    hints: false,
  },
};
