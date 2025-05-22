const EntryOptionPlugin = require("./EntryOptionPlugin");

/**
 * 挂载默认插件
 */
class WebpackOptionsApply {
  process(options, compiler) {
    //! 1.8.触发entryOption钩子：在解析入口选项前，Compiler触发entryOption钩子事件
    new EntryOptionPlugin().apply(compiler);
    //触发entryOption事件执行
    compiler.hooks.entryOption.call(options.context, options.entry);
    //! 1.10.触发afterPlugins钩子：在插件注册完毕后，Compiler触发afterPlugins钩子事件
    compiler.hooks.afterPlugins.call(compiler);
    //! 1.11.触发afterResolvers钩子：在解析器准备完毕后，Compiler触发afterResolvers钩子事件
    compiler.hooks.afterResolvers.call(compiler);
    return options;
  }
}

module.exports = WebpackOptionsApply;