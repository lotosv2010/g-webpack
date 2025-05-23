const { getNormalizedWebpackOptions } = require("./config/normalization");
const {
	applyWebpackOptionsBaseDefaults,//挂载插件前
  applyWebpackOptionsDefaults//挂载插件后
} = require("./config/defaults");
const Compiler = require('./Compiler');
const NodeEnvironmentPlugin = require("./node/NodeEnvironmentPlugin");
const WebpackOptionsApply = require("./WebpackOptionsApply");
function createCompiler(rawOptions){
    //获取一个规范化的配置对象
    const options = getNormalizedWebpackOptions(rawOptions);
    //应用默认配置项,都用来设置默认值 
    applyWebpackOptionsBaseDefaults(options);
    const compiler = new Compiler(options.context,options);
    new NodeEnvironmentPlugin().apply(compiler);
    //4.注册插件：将配置中的插件实例化并挂载到Compiler上
    //插件会在构建过程的各个阶段通过监听钩子来影响构建结果
    if(Array.isArray(options.plugins)){
       for(const plugin of options.plugins){
        plugin.apply(compiler);
       }
    }
    //5.初始化内置钩子：在初始化过程中，Webpack会初始化一些内置的钩子，
    //用于在构建过程中触发一些事件
    applyWebpackOptionsDefaults(options);
    //6.触发environment钩子：在环境准备好之前，Compiler触发environment钩子事件
    compiler.hooks.environment.call();
    //7.触发afterEnvironment钩子：在环境准备好之后，Compiler触发afterEnvironment钩子事件
    compiler.hooks.afterEnvironment.call();
    //挂载默认插件
    new WebpackOptionsApply().process(options, compiler);
    compiler.hooks.initialize.call();
    return compiler;
}
function webpack(config){
    //1.读取和解析配置：Webpack首先读取配置文件（如：webpack.config.js），将配置文件中的参数解析成一个配置对象。
    //如果没有指定配置文件，Webpack会使用默认配置
    //2.配置校验：Webpack使用schema-utils对解析得到的配置对象进行校验，确保配置参数正确无误
    validateSchema(config);
    //3.实例化Compiler：根据解析后的配置对象创建一个Compiler对象
    //Compiler对象是Webpack的核心，它负责管理整个构建过程
    const compiler = createCompiler(config);
    return compiler;
}
//在这里会对配置文件进行校验，如果格式不合法的话会报错，并退出编译 
function validateSchema(config){
  return config;
}
module.exports = webpack;