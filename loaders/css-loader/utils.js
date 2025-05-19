/**
 * 定义一个函数，用于生成 import 代码
 * @param {array} imports 导入的模块及其别名
 * @param {object} options 选项
 * @returns {string}
 */
function getImportCode(imports, options) {
  let code = "";
  // 遍历 imports 对象，生成 import 代码
  for (const { importName, url} of imports) {
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
 * @param {object} replacements  - 替换规则
 * @returns {string} 模块代码
 */
function getModuleCode(result, replacements) {
  let code = JSON.stringify(result.css);
  let beforeCode = `var cssLoaderExport = cssLoaderApiImport(cssLoaderApiNoSourcemapImport);\n`;
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
function getExportCode(options) {
  let code = "";
  let finalExport = "cssLoaderExport";
  code += `${options.esModule ? "export default" : "module.exports ="} ${finalExport};\n`;
  return code;
}

// 导出相关函数
exports.getImportCode = getImportCode;
exports.stringifyRequest = stringifyRequest;
exports.getModuleCode = getModuleCode;
exports.getExportCode = getExportCode;