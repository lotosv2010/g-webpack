const {
  getImportCode,
  stringifyRequest,
  getModuleCode,
  getExportCode
} = require('./utils');

/**
 * 定义 loader 函数
 * @param {string} content 通常是源文件的内容
 */
function loader(content) {
  // 获取 loader 的配置选项
  const options = this.getOptions();
  // 为异步回调创建一个回调函数
  const callback = this.async();
  // 定义要导入的模块及其别名
  const imports = [
    {
      importName: 'cssLoaderApiNoSourcemapImport',
      url: stringifyRequest(this, require.resolve('./runtime/noSourceMaps'))
    },
    {
      importName: 'cssLoaderApiImport',
      url: stringifyRequest(this, require.resolve('./runtime/api'))
    }
  ];

  // 使用工具函数生成导入代码
  const importCode = getImportCode(imports, options);
  // 使用工具函数生成模块代码
  const moduleCode = getModuleCode({ css: content });
  // 使用工具函数生成导出代码
  const exportCode = getExportCode(options);

  // 将生成的代码传递给异步回调函数
  callback(null, `${importCode}${moduleCode}${exportCode}`);
}

module.exports = loader;