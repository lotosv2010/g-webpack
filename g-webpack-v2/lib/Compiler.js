const { SyncHook, SyncBailHook, AsyncParallelHook, AsyncSeriesHook } = require('tapable');
const NormalModuleFactory = require('./NormalModuleFactory');
const Compilation = require('./Compilation');

/**
 * 编译器类
 */
class Compiler {
  constructor(context, options) {
    this.context = context; // 项目根目录
    this.options = options; // 配置项
    this.hooks = { // 钩子
      environment: new SyncHook(),
      afterEnvironment: new SyncHook(),
      initialize: new SyncHook(), 
      entryOption: new SyncBailHook(["context", "entry"]),
      compilation: new SyncHook(["compilation", "params"]),
      make: new AsyncParallelHook(["compilation"]),
      afterPlugins: new SyncHook(["compiler"]),
      afterResolvers: new SyncHook(["compiler"]),
      beforeRun: new AsyncSeriesHook(["compiler"]),
      run: new AsyncSeriesHook(["compiler"]),
      normalModuleFactory: new SyncHook(["normalModuleFactory"]),
      beforeCompile: new AsyncSeriesHook(["params"]),
      compile: new SyncHook(["params"]),
      thisCompilation: new SyncHook(["compilation", "params"]),
      finishMake:  new AsyncSeriesHook(["compilation"]),
      afterCompile: new AsyncSeriesHook(["compilation"]), 
    };
  }
  run(callback) {
    const finalCallback = (err, stats) => {
      // 构建完成，调用回调函数
      callback(err, stats);
    };
    const onCompiled = (err, stats) => {
      finalCallback(err, stats);
    };
    // 在运行编译器之前出发的钩子
    this.hooks.beforeRun.callAsync(this, err => {
      if (err) return finalCallback(err);
      // 在运行编译器时出发的钩子
      this.hooks.run.callAsync(this, err => {
        if (err) return finalCallback(err);
        //! 1.12.开始编译：调用Compiler的run方法开始执行编译过程。此时，Compiler会进入到构建流程的各个阶段，包括构建模块、分析依赖、优化等
        this.compile(onCompiled);
      })
    });
  }
  compile(callback) {
    debugger;
    // 创建新的编译参数对象
    const params = this.newCompilationParams();
    // 在编译之前调用钩子，并传入编译参数对象
    this.hooks.beforeCompile.callAsync(params, err => { 
      // 开始编译
      this.hooks.compile.call(params);
      // 创建新的编译对象
      const compilation = this.newCompilation(params);
      // 在创建模块及代码块之前调用钩子，并传入编译对象
      this.hooks.make.callAsync(compilation, err => {
        this.hooks.finishMake.callAsync(compilation, err => {
          process.nextTick(() => {
            compilation.finish(err => {
              compilation.seal(err => {
                this.hooks.afterCompile.callAsync(compilation, err => {
                  return callback(null, compilation);
                });
              })
            })
          })
        });
      });
    });
  }
  /**
   * 创建compilation对象
   */
  newCompilationParams() {
    const params = {
      normalModuleFactory: this.createNormalModuleFactory(),
    }
    return params;
  }
  /**
   * 创建普通模块工厂
   */
  createNormalModuleFactory() {
    // 创建一个普通模块工厂
    const  normalModuleFactory = new NormalModuleFactory({
      context: this.options.context
    });
    // 当创建好一个普通模块工厂的时候，会触发normalModuleFactory钩子
    this.hooks.normalModuleFactory.call(normalModuleFactory);
    return normalModuleFactory;
  }
  /**
   * 创建编译对象
   */
  newCompilation(params) {
    const compilation = this.createCompilation(params);
    // 在当前编译之前，会触发thisCompilation钩子
    this.hooks.thisCompilation.call(compilation, params);
    // 在新的编译实例创建之后，会触发compilation钩子
    this.hooks.compilation.call(compilation, params);
    return compilation;
  }
  /**
   * 创建 compilation 对象
   */
  createCompilation(params) {
    return new Compilation(this, params);
  }
}

module.exports = Compiler;