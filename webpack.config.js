const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  // devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    clean: true,
  },
  devServer: {
    port: 3030,
    open: false,
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
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: "babel-loader",
      //   },
      // },
      {
        test: /\.css$/,
        use: [
          {
            loader: path.resolve('loaders/style-loader')
          },
          {
            // loader: 'css-loader',
            loader: path.resolve('loaders/css-loader'),
            options: {
              modules: false,
            },
          },
        ],
        include: path.resolve(__dirname, "src"),
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};