const path = require('path');
// 引入自定义的webpack模块
// const webpack = require('webpack');
const webpack = require('../../g-webpack-v2/lib/webpack');
// 引入Node.js的文件系统模块，用于操作文件
const fs = require('fs');
// 引入webpack配置文件
const config = require('./webpack.config');

// 使用配置文件创建一个webpack编译器实例
const compiler = webpack(config);
// 运行编译器，开始构建过程
debugger
compiler.run((err, stats) => {
  // 打印构建错误信息（如果有的话）
  if (err) return console.log(err.message);
  console.log(stats);
  // 将构建统计数据转换为JSON字符串，包括模块、代码块和资源信息
  // let statsString = JSON.stringify(stats.toJson({
  //   modules: true,
  //   chunks: true,
  //   assets: true
  // }));
  // 将统计数据字符串写入文件myStats.json，用于分析构建过程
  // __dirname 代表当前文件所在目录
  // fs.writeFileSync(path.resolve(__dirname, 'dist', 'myStats.json'), statsString);
});