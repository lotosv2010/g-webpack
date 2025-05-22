const  EntryDependency = require("./dependencies/EntryDependency");

/**
 * EntryPlugin 插件
 */
class EntryPlugin {
  constructor(context, entry, options) {
    this.context = context; // 根目录
    this.entry = entry; // 入口
    this.options = options || {}; // 配置项

  }
  apply(compiler) {
    // 注册compilation钩子, 当我们开始编译时，会触发compilation钩子，此时可以获取compilation对象
    // normalModuleFactory: 模块工厂对象
    compiler.hooks.compilation.tap("EntryPlugin", (compilation, { normalModuleFactory }) => {
      // 注册入口依赖和模块工厂的关联
      compilation.dependencyFactories.set(EntryDependency, normalModuleFactory); // EntryDependency: 入口依赖 要通过 EntryDependency 创建模块工厂对象，来生产对应的入口模块
    });
    //! 9.解析入口文件：根据配置对象的entry属性解析入口文件。Webpack会为每个入口文件创建一个Chunk，并确定各个模块之间的依赖关系。
    const { entry, options, context } = this;
    //  调用静态方法通过entry得到一个依赖实例
    const dep = EntryPlugin.createDependency(entry, options);
    // 注册make钩子，在make钩子中调用addEntry方法
    compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
      // TODO 此处时真正进入第二个流程，编译流程
      compilation.addEntry(context, dep, options, callback);
    });
  }

  static createDependency(entry, options) {
    return new EntryDependency(entry);
  }
}

module.exports = EntryPlugin;