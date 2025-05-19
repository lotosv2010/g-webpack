// 定义一个函数，用于生成 import 代码
function getImportCode(imports, options) {
  let code = "";
  // 遍历 imports 对象，生成 import 代码
  for (const { importName, url} of imports) {
    code += `var ${importName} = require(${url});\r\n`;
  }
  return code;
}

// 定义一个函数，用于将请求字符串转换为相对路径字符串
function stringifyRequest(loaderContext, request) {
  // contextify 是 webpack 5 新的方法，用来计算相对路径
  // loaderContext.context 当前正在转换的模块的绝对路径
  return JSON.stringify(loaderContext.utils.contextify(loaderContext.context, request));
}

/**
 * 定义一个函数，用于生成模块代码
 * @param {object} options 
 */
function getModuleCode(result) {
  let code = JSON.stringify(result.css);
  let beforeCode = `var cssLoaderExport = cssLoaderApiImport(cssLoaderApiNoSourcemapImport);\n`;
  return `${beforeCode}cssLoaderExport.push([module.id, ${code}]);\n`;
}

/**
 * 定义一个函数，用于生成导出代码
 * @param {object} options 
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