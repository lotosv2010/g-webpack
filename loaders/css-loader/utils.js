const path = require("path");
const postcssModulesScope = require("./postcss-modules-scope");

/**
 * 定义一个函数，用于生成 import 代码
 * @param {array} imports 导入的模块及其别名
 * @param {object} options 选项
 * @returns {string}
 */
function getImportCode(imports, options) {
  let code = "";
  // 遍历 imports 对象，生成 import 代码
  for (const { importName, url } of imports) {
    code += `var ${importName} = require(${url});\r\n`;
  }
  return code;
}

/**
 * 定义一个函数，用于将请求字符串转换为相对路径字符串
 * @param {object} loaderContext Loader 上下文对象
 * @param {string} request 请求字符串
 * @returns 
 */
function stringifyRequest(loaderContext, request) {
  // contextify 是 webpack 5 新的方法，用来计算相对路径
  // loaderContext.context 当前正在转换的模块的绝对路径
  return JSON.stringify(loaderContext.utils.contextify(loaderContext.context, request));
}

/**
 * 定义一个函数，用于生成模块代码
 * @param {object} result - 样式文件的内容
 * @param {object} api - postcss-import 插件的 api
 * @param {object} replacements  - 替换规则
 * @returns {string} 模块代码
 */
function getModuleCode(result, api, replacements) {
  let code = JSON.stringify(result.css);
  let beforeCode = `var cssLoaderExport = cssLoaderApiImport(cssLoaderApiNoSourcemapImport);\n`;
  for (const item of api) {
    beforeCode += `cssLoaderExport.i(${item.importName});\n`;
  }
  for (const { replacementName, importName } of replacements) {
    beforeCode += `var ${replacementName} = cssLoaderGetUrlImport(${importName});\n`;
    code = code.replace(new RegExp(replacementName, 'g'), () => `"+ ${replacementName} +"`);
  }
  return `${beforeCode}cssLoaderExport.push([module.id, ${code}]);\n`;
}

/**
 * 定义一个函数，用于生成导出代码
 * @param {object} options - 选项对象
 */
function getExportCode(exports, options) {
  let code = "";
  let localsCode = ""; // 存储生成的本地变量代码
  // 遍历生成的本地变量，生成导出代码
  const addExportToLocalsCode = (name, value) => {
    if(localsCode) {
      localsCode += `,\n`;
    }
    localsCode += `\t${JSON.stringify(name)}: ${JSON.stringify(value)}`;
  };
  for (const { name, value} of exports) {
    addExportToLocalsCode(name, value);
  }
  if (options.modules.exportOnlyLocals) {
    code += `${options.esModule ? "export default" : "module.exports ="} {\n${localsCode}\n};\n`;
    return code;
  }
  const finalExport = "cssLoaderExport";
  code += `cssLoaderExport.locals = {\n${localsCode}\n};\n` ;
  code += `${options.esModule ? "export default" : "module.exports ="} ${finalExport};\n`;
  return code;
}

/**
 *  合并请求
 * @param {string} preRequest 请求前缀
 * @param {string} url 请求地址
 * @returns {string} 合并后的url
 */
function combineRequests(preRequest, url) {
  return preRequest ? `${preRequest}${url}` : url;
}

/**
 * 获取要执行的loader
 * @param {string} loaders 所有的loader
 * @param {number} loaderIndex 当前loader的索引
 * @param {number} importLoaders 用户配置要执行的loader的数量
 * @returns {string} 要执行的loader
 */
function getPreRequester({ loaders, loaderIndex }, { importLoaders = 0 }) {
  const loadersRequest = loaders.slice(loaderIndex, loaderIndex + 1 + importLoaders).map(x => x.request).join("!");
  return "-!" + loadersRequest + "!";
}

/**
 * 是否使用modules
 * @param {object} options - 用户配置
 * @returns {boolean} 是否使用modules
 */
function shouldUseModulesPlugins(options) {
  if (typeof options.modules === "boolean" && options.modules === false) {
    return false;
  }
  return true
}

/**
 * 是否使用icss
 * @param {object} options - 用户配置
 * @returns {boolean} 是否使用icss
 */
function shouldUseIcssPlugin(options) {
  return Boolean(options.modules);
}

/**
 * 获取modules插件
 * @param {object} loaderContext - loader上下文
 * @returns {array} modules插件
 */
function getModulesPlugins(loaderContext) {
  let plugins = [postcssModulesScope({ loaderContext })];
  return plugins;
}

// 导出相关函数
exports.getImportCode = getImportCode;
exports.stringifyRequest = stringifyRequest;
exports.getModuleCode = getModuleCode;
exports.getExportCode = getExportCode;
exports.getPreRequester = getPreRequester;
exports.combineRequests = combineRequests;
exports.shouldUseModulesPlugins = shouldUseModulesPlugins;
exports.shouldUseIcssPlugin = shouldUseIcssPlugin;
exports.getModulesPlugins = getModulesPlugins;