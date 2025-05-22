/**
 * 编译类
 */
class Compilation {
  constructor() {
    this.dependencyFactories = new Map();
  }
  // 添加入口
  addEntry(context, dep, options, callback) {
    console.log("Compilation.addEntry", context, dep, options, this);
  }
}

module.exports = Compilation;