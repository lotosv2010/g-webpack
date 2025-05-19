// 定义包含各个模块的对象
const webpackModules = {
  // 定义 "./src/index.css" 模块
  "./src/index.css": (module, unusedWebpackExports, webpackRequire) => {
    // 导入 noSourceMaps 运行时
    var cssLoaderApiNoSourcemapImport = webpackRequire(
      "./node_modules/css-loader/dist/runtime/noSourceMaps.js"
    );
    // 导入 css-loader API 运行时
    var cssLoaderAipImport = webpackRequire(
      "./node_modules/css-loader/dist/runtime/api.js"
    );
    // 使用 css-loader API 运行时处理 noSourceMaps 运行时
    const cssLoaderExport = cssLoaderAipImport(cssLoaderApiNoSourcemapImport);
    // 将处理后的 CSS 内容添加到 cssLoaderExport
    cssLoaderExport.push([
      module.id,
      "body {\r\n   color: red;\r\n}"
    ]);
    // 将 cssLoaderExport 导出
    module.exports = cssLoaderExport;
  },
  // 定义 css-loader 的 API 运行时模块
  "./node_modules/css-loader/dist/runtime/api.js": function (module) {
    "use strict";
    // 导出一个函数，处理 cssWithMappingToString 并返回一个列表
    module.exports = function (cssWithMappingToString) {
      var list = [];
      // 定义 list 的 toString 方法，将列表中的内容转换为字符串
      list.toString = function toString() {
        return this.map(function (item) {
          var content = "";
          content += cssWithMappingToString(item);
          return content;
        }).join("\r\n");
      };
      list.i = function (modules) {
        for (let i = 0; i < modules.length; i++) {
          const item = [].concat(modules[i]);
          list.push(item);
        }
      };
      return list;
    };
  },
  // 定义 noSourceMaps 运行时模块
  "./node_modules/css-loader/dist/runtime/noSourceMaps.js": module => {
    // 导出一个函数，用于处理 i 参数
    module.exports = function (i) {
      return i[1];
    }
  }
};

// 定义一个缓存对象，用于存储已加载的模块
var webpackModuleCache = {};

// 定义一个模块加载函数，根据模块 ID 加载模块
function webpackRequire(moduleId) {
  // 检查缓存中是否已有该模块
  var cacheModule = webpackModuleCache[moduleId];
  if(cacheModule) {
    return cacheModule.exports;   
  }

  // 创建一个新的模块对象，并添加到缓存中
  var module = webpackModuleCache[moduleId] = {
    id:  moduleId,
    exports: {}
  };

  // 执行指定模块 ID 的模块代码
  webpackModules[moduleId](module, module.exports, webpackRequire);
  // 返回模块的导出
  return module.exports;
}

// 使用 webpackRequire 函数加载 "./src/index.css" 模块
const indexCss = webpackRequire("./src/index.css");
// 在控制台输出加载到的模块内容
console.log(indexCss);