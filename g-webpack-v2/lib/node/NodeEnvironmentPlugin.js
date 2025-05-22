const fs = require("fs");

/**
 * 创建一个 NodeEnvironmentPlugin 插件
 */
class NodeEnvironmentPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.inputFileSystem = fs; // 指定读取文件的模块为 fs 模块
    compiler.outputFileSystem = fs; // 指定写入文件的模块为 fs 模块
  }
}

module.exports = NodeEnvironmentPlugin;