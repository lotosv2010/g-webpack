// 引入 icss-utils 模块
var icssUtils = require("icss-utils");

/**
 * 定义插件函数，接收一个默认为空对象的 options 参数
 * @param {object} options - 插件选项
 * @returns 一个包含插件定义的对象
 */
const plugin = (options = {}) => {
  return {
    // 设置插件名称为 "postcss-icss-parser"
    postcssPlugin: "postcss-icss-parser",
    // 在 PostCSS AST 遍历完成后执行这个异步方法
    async OnceExit(root) {
      // 从 AST 根节点提取 ICSS 导出信息
      const { icssExports } = icssUtils.extractICSS(root);
      // 遍历提取到的所有导出名称
      for (const name of Object.keys(icssExports)) {
        // 获取当前导出名称对应的值
        const value = icssExports[name]
        // 将当前导出名称和值添加到 options.exports 数组中
        options.exports.push({ name, value });
      }
    }
  };
};
// 设置插件与 postcss 兼容
plugin.postcss = true;
// 导出插件
module.exports = plugin;