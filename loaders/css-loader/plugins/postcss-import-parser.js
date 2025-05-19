// 引入 postcss-value-parser 模块
const valueParser = require("postcss-value-parser");

/**
 * 解析 @import 规则节点，提取 URL
 * @param {object} atRule - @import 规则节点
 * @returns {object} 包含 atRule 和 url 的对象
 */
function parseNode(atRule) {
  const { nodes } = valueParser(atRule.params);;
  return { atRule, url:nodes[0].value };
}

/**
 * 定义 postcss 插件，用于处理 @import 规则
 * @param {object} params - 插件参数
 * @returns {object} postcss-import-parse 插件对象
 */
const plugin = ({ imports = [], loaderContext, api, urlHandler }) => {
  return {
    postcssPlugin: "postcss-import-parser",
    prepare() {
      // 存储解析到的 @import 规则
      const parsedAtRules = [];
      return {
        // 对于 AtRule 类型的节点，如果是 import 规则则处理
        AtRule: {
          import(atRule) {
            let parsedAtRule = parseNode(atRule);
            parsedAtRules.push(parsedAtRule);
          }
        },
        // 当 postcss 处理完成后，处理解析到的 @import 规则
        async OnceExit() {
          if (parsedAtRules.length === 0) {
            return;
          }
          // 使用 webpack 的解析器来解析 URL
          const resolver = loaderContext.getResolve();
          for (let index = 0; index <= parsedAtRules.length - 1; index++) {
            const parsedAtRule = parsedAtRules[index];
            const { atRule, url } = parsedAtRule;
            // 删除原始的 @import 规则
            atRule.remove();
            // 解析 URL
            const resolvedUrl = await resolver(loaderContext.context, "./" + url)
            let importName = `cssLoaderAtRuleImport_${index}`;
            api.push({ importName, url })
            imports.push({ type: 'rule_import', importName, url: urlHandler(resolvedUrl) });
          }
        }
      };
    }
  };
};
module.exports = plugin;