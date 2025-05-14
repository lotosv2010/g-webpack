const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/entry1.js",
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    clean: true,
  },
  devServer: {
    port: 3030,
    open: true,
    hot: false,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  resolveLoader: {
    alias: {
      "babel-loader": path.resolve(__dirname, "loaders/babel-loader.js"),
    },
    modules: [path.resolve("./loaders"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};