const { SyncHook } = require("tapable");

/**
 * 编译类
 */
class Compilation {
  constructor() {
    this.dependencyFactories = new Map();
    this.entries = new Map(); // 存放入口(key, name, entryData)
    this.hooks = {
      seal:  new SyncHook([]),
      addEntry: new SyncHook(['entry', 'options']),
    }
    this.modules = [];
    this.chunks = [];
    this.assets = {};
  }

  _addEntryItems(context, entry, target, optionsOrName, callback) {
    const  { name } = optionsOrName; // 获取入口名称
    // 创建入口数据对象
    const entryData = {
      dependencies: [],
      options: optionsOrName,
    };
    // 添加入口数据
    entryData[target].push(entry);
    // 添加入口数据到入口集合中
    this.entries.set(name, entryData);
    // 调用addEntry钩子
    this.hooks.addEntry.call(name, optionsOrName);

    // TODO
    callback();
  }
  
  /**
   * TODO 开始从入口编译
   * @param {string} context 根目录
   * @param {object} entry 入口
   * @param {object} optionsOrName 
   * @param {function} callback 回调
   */
  addEntry(context, entry, optionsOrName, callback) {
    this._addEntryItems(context, entry, 'dependencies', optionsOrName, callback);
  }

  finish(callback) {
    return callback();
  }
  /**
   * 封存，把模块封装成代码块
   */
  seal(callback) {
    this.hooks.seal.call();
    return callback();
  }
  toJson(options) {
    return {
      modules: this.modules.map((module) => module.toJson(options)),
      chunks: this.chunks.map((chunk) => chunk.toJson(options)),
      assets: Object.keys(this.assets).map((key) => ({
        name: key,
        source: this.assets[key].source(),
        size: this.assets[key].size(),
      })),
    };
  }
}

module.exports = Compilation;