const path = require('path'); //output tanimlarken absolute path kullnilmasi gerekiyor
const TerserPlugin = require('terser-webpack-plugin'); //minimize js content
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: { bundle: './public/js/index.js', 'styles-libs': './public/scss/styles-libs.scss' },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './public/dist'), //create dist directory and save it bundle.js
    publicPath: ''
  },
  watch: true,
  watchOptions: {
    ignored: ['node_modules/**']
  },
  mode: 'development',
  devtool: 'source-map', //Webpack default uses eval and throws `unsafe-eval` error
  module: {
    // how to import files
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader' // once css-loader calisir sonra style-loader
        ]
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'] //convert ES6 to support old browsers
      }
    ]
  },
  plugins: [
    new TerserPlugin(), // minimize js content
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }), // extract css into separate file
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['public/dist']
    }) // removes unused files in dist folder
  ]
};
