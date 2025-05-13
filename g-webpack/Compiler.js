// 引入tapable库中的SyncHook类，用于创建同步钩子
const { SyncHook } = require("tapable");
// 引入path模块，用于处理文件和目录路径
const path = require("path");
// 引入自定义的Complication模块
const Complication = require("./Complication");
// 引入Node.js的文件系统模块，用于操作文件
const fs = require("fs");

// 定义Compiler类
class Compiler {
  // 构造函数，接收一个options参数
  constructor(options) {
    // 保存options配置
    this.options = options;
    // 初始化钩子对象，包含run和done两个同步钩子
    this.hooks = {
      run: new SyncHook(),
      done: new SyncHook(),
    };
  }
  // run方法，接收一个回调函数callback
  run(callback) {
    // 调用run钩子
    this.hooks.run.call();
    // 定义onCompiled回调函数，用于处理编译结果
    const onCompiled = (err, stats, fileDependencies) => {
      // 获取编译生成的资源
      const { assets } = stats;
      // 遍历资源，将资源写入输出目录
      for (let filename in assets) {
        let filePath = path.posix.join(this.options.output.path, filename);
        fs.writeFileSync(filePath, assets[filename], "utf-8");
      }
      // 调用外部传入的回调函数
      callback(err, { toJson: () => stats });
      // 监听文件依赖的变化，重新编译
      [...fileDependencies].forEach((file) => {
        fs.watch(file, () => this.compile(onCompiled));
      });
    };
    // 开始编译
    this.compile(onCompiled);
    // 调用done钩子
    this.hooks.done.call();
  }
  // 编译方法
  compile(onCompiled) {
    // 创建Complication实例
    const complication = new Complication(this.options);
    // 调用Complication的build方法开始构建
    complication.build(onCompiled);
  }
}
// 导出Compiler类
module.exports = Compiler;
