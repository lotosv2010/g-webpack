const {
  getImportCode,
  stringifyRequest,
  getModuleCode,
  getExportCode
} = require('./utils');
const postcss = require('postcss');
const urlParser = require('./plugins/postcss-url-parser');

/**
 * 定义 loader 函数
 * @param {string} content 通常是源文件的内容
 */
function loader(content) {
  // 获取 loader 的配置选项
  const defaultOptions = {
    url: true,
    import: true,
    modules: undefined,
    sourceMap: this.sourceMap,
    importLoaders: 0,
    esModule: true,
    exportType: 'array',
  };
  const options = { ...defaultOptions, ...this.getOptions() };
  // 为异步回调创建一个回调函数
  const callback = this.async();
  const plugins = []; // 存放 postcss 插件
  const replacements = []; // 存放替换内容
  const urlPluginImports = []; // 存放 postcss-url-parser 插件的导入内容
  // 如果配置了 url 选项, 则添加 postcss-url-parser 插件
  if (options.url) {
    plugins.push(urlParser({
      imports: urlPluginImports,
      replacements,
      loaderContext: this,
      urlHandler: url => stringifyRequest(this, url) // 将 url 转换为 require 语句
    }));
  }
  // 创建 PostCSS 实例并执行处理
  postcss(plugins)
    .process(content, {
      from: this.resourcePath,
      to: this.resourcePath
    })
    .then(result => {
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

      // 获取插件的导入信息
      imports.push(...urlPluginImports);

      // 使用工具函数生成导入代码
      const importCode = getImportCode(imports, options);
      // 使用工具函数生成模块代码
      const moduleCode = getModuleCode(result, replacements);
      // 使用工具函数生成导出代码
      const exportCode = getExportCode(options);

      // 将生成的代码传递给异步回调函数
      callback(null, `${importCode}${moduleCode}${exportCode}`);
    });
}

module.exports = loader;