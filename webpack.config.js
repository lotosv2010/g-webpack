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
            // loader: 'style-loader',
          },
          {
            // loader: 'css-loader',
            loader: path.resolve('loaders/css-loader'),
            options: {
              esModule: false,
              url: true,
              import: true,
              importLoaders: 0, // 在处理css文件之前，要执行的loader的数量
              modules: {
                mode: 'local',
                exportOnlyLocals: false, // exportOnlyLocals 为 true 时，只编译 css 文件，不输出 css 文件，需要配合 mini-css-extract-plugin 使用
              }
            },
          },
        ],
        include: path.resolve(__dirname, "src"),
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};