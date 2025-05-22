const EntryPlugin = require("./EntryPlugin");

/**
 * 获取入口配置
 */
class EntryOptionPlugin {
  apply(compiler) {
    // 监听 entryOption 事件
    compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
      EntryOptionPlugin.applyEntryOption(compiler, context, entry);
      return true;
    });
  }
  /**
   * 获取入口配置
   * @param {object} compiler 解析器实例
   * @param {string} context 上下文
   * @param {array} entry 入口
   */
  static applyEntryOption(compiler, context, entry) {
    for (const [name, desc] of Object.entries(entry)) {
      const options = { name };
      for (const entry of desc.import) {
        new EntryPlugin(context, entry, options).apply(compiler);
      }
    }
  }
}

module.exports = EntryOptionPlugin;