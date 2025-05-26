const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const RunPlugin = require("./plugins/run-plugin");
const DonePlugin = require("./plugins/done-plugin");
const ArchivePlugin = require("./plugins/archive-plugin");
const AutoExternalPlugin = require("./plugins/auto-external-plugin");

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
  // externals: {
  //   lodash: "_",
  //   jQuery: "$",
  // },
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
    new RunPlugin(),
    new DonePlugin(),
    new ArchivePlugin(),
    new AutoExternalPlugin({
      jquery:{//自动把jquery模块变成一个外部依赖模块
        variable:'jQuery',//不再打包，而是从window.jQuery变量上获取jquery对象
        url:'https://cdn.bootcss.com/jquery/3.1.0/jquery.js'//CDN脚本
      },
      lodash:{//自动把jquery模块变成一个外部依赖模块
        variable:'_',//不再打包，而是从window.jQuery变量上获取jquery对象
        url:'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js'//CDN脚本
      }
    }),
  ],
};