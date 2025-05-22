const path = require("path");

module.exports = {
  mode: 'development',
  context: process.cwd(),
  devtool: false,
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
}