const babel = require('@babel/core');  // 引入Babel

/**
 * babel-loader只是提供一个转换函数，但是它并不知道要干啥要转啥
 * @babel/core 负责把源代码转成AST，然后遍历AST，然后重新生成新的代码
 * 但是它并不知道如何转换语换法，它并不认识箭头函数，也不知道如何转换
 * @babel/transform-arrow-functions 插件其实是一个访问器，它知道如何转换AST语法树
 * 因为要转换的语法太多，插件也太多。所以可一堆插件打包大一起，成为预设preset-env
 *
 * @param {*} sourceCode 源代码
 * @param {*} inputSourceMap 源码的sourcemap
 * @param {*} inputAst AST语法树
 * @returns 
 */
function loader(sourceCode, inputSourceMap, inputAst) {
  const filename = this.resourcePath; // 当前文件的绝对路径
  const useOptions = this.getOptions(); // 获取loader的options

  const options = {
    filename, // 配置 Babel 的 filename 选项
    inputSourceMap, // 配置 Babel 的 inputSourceMap 选项
    sourceMaps: true, // 配置 Babel 的 sourceMaps 选项
    sourceFileName: filename, // 配置 Babel 的 sourceFileName 选项
    ast: inputAst, // 配置 Babel 的 ast 选项
    ...useOptions, // 其他配置项
  };

  const config = babel.loadPartialConfig(options); // 获取 Babel 的配置
  if (config) {
    // 使用Babel转换代码
    const result = babel.transformSync(sourceCode, config.options);
    // 调用Webpack提供的callback返回转换后的代码
    return this.callback(null, result.code, result.map, result.ast);
  }
  return sourceCode;
}

loader.pitch = function() {}

module.exports = loader; 