
const { getNormalizedWebpackOptions } = require('./config/normalization');
const { applyWebpackOptionsBaseDefaults, applyWebpackOptionsDefaults } = require('./config/defaults');
const Compiler = require('./Compiler');
const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin');
const WebpackOptionsApply = require('./WebpackOptionsApply');

/**
 * 校验配置文件
 * @param {object} config 配置项
 * @return {object} 配置项
 */
const validateSchema = config => {
  return config;
}

/**
 * 创建编译器
 * @param {object} rawOptions webpack配置
 * @return {object} 创建的编译器实例
 */
const createCompiler = rawOptions => {
  // 获取配置项
  const options = getNormalizedWebpackOptions(rawOptions);
  // 配置项基础设置
  applyWebpackOptionsBaseDefaults(options);
  // 创建编译器实例
  const compiler = new Compiler(options.context, options);
  // 添加内置插件 
  new NodeEnvironmentPlugin().apply(compiler);
  //! 1.4.注册插件：将配置中的插件实例化并挂载到Compiler上。插件会在构建过程的各个阶段通过监听钩子来影响构建结果
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      plugin.apply(compiler);
    }
  }
  //! 1.5.初始化内置钩子：在初始化过程中，Webpack会初始化一些内置的钩子，用于在构建过程中触发一些事件
  applyWebpackOptionsDefaults(options);
  //! 1.6.触发environment钩子：在环境准备好之前，Compiler触发environment钩子事件
  compiler.hooks.environment.call();
  //! 1.7.触发afterEnvironment钩子：在环境准备好之后，Compiler触发afterEnvironment钩子事件
  compiler.hooks.afterEnvironment.call();
  // 挂载默认插件
  new WebpackOptionsApply().process(options, compiler);
  // 触发 initialize 钩子
  compiler.hooks.initialize.call();
  // console.dir(options, { depth: null });
  return compiler;
}

/**
 * 创建webpack
 * @param {object} config webpack配置
 * @return {object} 返回 Compiler 实例
 */
const webpack = config => {
  debugger
  //! 1.1.读取和解析配置：Webpack首先读取配置文件（如：webpack.config.js），将配置文件中的参数解析成一个配置对象。如果没有指定配置文件，Webpack会使用默认配置
  //! 1.2.配置校验：Webpack使用schema-utils对解析得到的配置对象进行校验，确保配置参数正确无误
  validateSchema(config);
  //! 1.3.实例化Compiler：根据解析后的配置对象创建一个Compiler对象。Compiler对象是Webpack的核心，它负责管理整个构建过程
  const compiler = createCompiler(config);
  return compiler;
}

module.exports = webpack;