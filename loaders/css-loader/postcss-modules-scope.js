// 引入 postcss-selector-parser 模块
const selectorParser = require("postcss-selector-parser");
// 引入 crypto 模块，用于生成哈希值
const crypto = require("crypto");

/**
 * 定义生成范围限定名称的函数，接收类名和加载器上下文作为参数
 * @param {string} name - 类名
 * @param {object} loaderContext - loader上下文
 * @returns {string} - 生成的范围限定名称
 */
function generateScopedName(name, loaderContext) {
  // 使用 MD4 哈希算法创建一个新哈希对象
  const hash = crypto.createHash('sha256')
  // 使用 loader 上下文的资源路径更新哈希
  hash.update(loaderContext.resourcePath);
  // 返回生成的范围限定名称，包含哈希值和原始名称
  return `_${hash.digest('hex').substring(0, 12)}__${name}`;
};

/**
 * 定义插件函数，接收一个包含 loaderContext 的对象作为参数
 * @param {object} param 插件参数
 * @returns 插件函数
 */
const plugin = ({ loaderContext }) => {
  return {
    // 设置插件名称为 "postcss-modules-scope"
    postcssPlugin: "postcss-modules-scope",
    // 在 PostCSS AST 的根节点执行这个方法
    Once(root, { rule }) {
      // 创建一个空的导出对象
      const exports = Object.create(null);
      // 定义导出范围限定名称的函数
      function exportScopedName(name) {
        // 生成范围限定名称
        const scopedName = generateScopedName(name, loaderContext);
        // 将生成的名称添加到导出对象中
        exports[name] = scopedName;
        // 返回生成的名称
        return scopedName;
      }
      // 根据节点类型处理节点，返回处理后的节点
      function localizeNode(node) {
        switch (node.type) {
          case "selector":
            node.nodes = node.map(localizeNode);
            return node;
          case "class":
            return selectorParser.className({
              value: exportScopedName(node.value)
            });
        }
      }
      // 遍历节点，并根据节点类型进行相应处理
      function traverseNode(node) {
        if (node.type === "pseudo" && node.value === ":local") {
          const selector = localizeNode(node.first);
          node.replaceWith(selector);
          return;
        }
        if (node.type === "root" || node.type === "selector") {
          node.each(traverseNode);
        }
        return node;
      }
      // 遍历根节点的所有规则
      root.walkRules(rule => {
        let parsedSelector = selectorParser().astSync(rule);
        rule.selector = traverseNode(parsedSelector.clone()).toString();
      });
      // 获取导出对象中的所有名称
      const exportedNames = Object.keys(exports);
      // 如果存在导出名称，则创建一个新的导出规则
      if (exportedNames.length > 0) {
        const exportRule = rule({
          selector: ":export"
        });
        // 将导出名称添加到导出规则中
        exportedNames.forEach(exportedName => exportRule.append({
          prop: exportedName,
          value: exports[exportedName],
          raws: { before: "\n  " }
        }));
        // 将导出规则添加到根节点
        root.append(exportRule);
      }
    }
  };
};
// 设置插件与 postcss兼容
plugin.postcss = true;
// 将插件导出，以便在其他模块中使用
module.exports = plugin;