const {
  getImportCode,
  stringifyRequest,
  getModuleCode,
  getExportCode,
  combineRequests,
  getPreRequester,
  shouldUseIcssPlugin,
  shouldUseModulesPlugins,
  getModulesPlugins
} = require('./utils');
const postcss = require('postcss');
const urlParser = require('./plugins/postcss-url-parser');
const importParser = require('./plugins/postcss-import-parser');
const icssParser = require('./plugins/postcss-icss-parser');

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
  const exports = []; // 存放导出内容
  // 如果 options.modules 为 true，则添加 css-modules 相关的插件
  if (shouldUseModulesPlugins(options)) {
    plugins.push(...getModulesPlugins(this));
  }
  const urlPluginImports = []; // 存放 postcss-url-parser 插件的导入内容
  const importPluginImports = []; // 存放 postcss-import 插件的导入内容
  const importPluginApi = []; // 存放 postcss-import 插件的 api 内容
  //  如果启用了 import 选项， 则添加 postcss-import 插件
  if(options.import) {
    plugins.push(importParser({
      imports: importPluginImports,
      api: importPluginApi,
      loaderContext: this,
      urlHandler: url => stringifyRequest(this, combineRequests(getPreRequester(this, options.importLoaders), url)),
    }));
  }
  // 如果配置了 url 选项, 则添加 postcss-url-parser 插件
  if (options.url) {
    plugins.push(urlParser({
      imports: urlPluginImports,
      replacements,
      loaderContext: this,
      urlHandler: url => stringifyRequest(this, url) // 将 url 转换为 require 语句
    }));
  }

  // 是否需要使用 icss-utils 插件
  const needToUseIcssPlugin = shouldUseIcssPlugin(options);
  // 如果需要使用 icss-utils 插件, 则添加 icss-utils 插件
  if (needToUseIcssPlugin) {
    plugins.push(icssParser({
      loaderContext: this,
      exports
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
      imports.push(...urlPluginImports, ...importPluginImports);

      // 使用工具函数生成导入代码
      const importCode = getImportCode(imports, options);
      // 使用工具函数生成模块代码
      const moduleCode = getModuleCode(result, importPluginApi, replacements);
      // 使用工具函数生成导出代码
      const exportCode = getExportCode(exports, options);

      // 将生成的代码传递给异步回调函数
      callback(null, `${importCode}${moduleCode}${exportCode}`);
    });
}

module.exports = loader;