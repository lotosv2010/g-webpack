/**
 * @file HookCodeFactory.js
 * @description 钩子代码工厂，负责生成钩子的执行代码（如串行/并行等）。
 */

/**
 * 钩子代码工厂基类
 */
class HookCodeFactory {
  /**
   * 设置钩子实例，将所有 tap 的回调函数提取出来赋值给 _x
   * @param {Object} hookInstance
   * @param {Object} options
   */
  setup(hookInstance, options) {
    hookInstance._x = options.taps.map(item => item.fn);
  }

  /**
   * 初始化工厂，保存 options
   * @param {Object} options
   */
  init(options) {
    this.options = options;
  }

  /**
   * 反初始化，清空 options
   */
  deinit() {
    this.options = null;
  }

  /**
   * 生成参数字符串，可插入 before/after 参数
   * @param {Object} options
   * @returns {string}
   */
  args(options = {}) {
    let { before, after } = options;
    let allArgs = this.options.args || [];
    if (before) allArgs = [before, ...allArgs];
    if (after) allArgs = [...allArgs, after];
    if (allArgs.length > 0)
      return allArgs.join(', ');
    return "";
  }

  /**
   * 生成函数头部代码，定义 _x（所有 tap 回调的数组）
   * @returns {string}
   */
  header() {
    let code = "";
    code += "var _x = this._x;\n";
    return code;
  }

  /**
   * 创建最终的钩子执行函数
   * @param {Object} options
   * @returns {Function}
   */
  create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
      case 'sync':
        // 生成同步钩子的执行函数
        fn = new Function(
          this.args(),
          this.header() + this.content()
        )
        break;
      case 'async':
        // 生成异步钩子的执行函数
        fn = new Function(
          this.args({ after: '_callback' }),
          this.header() + this.content({ onDone: () => " _callback();\n" })
        )
        break;
      case 'promise':
        // 生成 promise 钩子的执行函数
        let tapsContent = this.content({ onDone: () => " _resolve();\n" });
        let content = `return new Promise(function (_resolve, _reject) {
          ${tapsContent}
        })`;
        fn = new Function(
          this.args(),
          this.header() + content
        );
        break;
      default:
        break;
    }
    this.deinit();
    return fn;
  }

  /**
   * 串行调用所有 tap，生成串行执行的代码
   * @returns {string}
   */
  callTapsSeries({ onDone } = {}) {
    if (this.options.taps.length === 0) {
      return onDone();
    }
    let code = "";
    let current = onDone;
    for (let j = this.options.taps.length - 1; j >= 0; j--) {
      let i = j;
      const unroll = (current !== onDone); // && (this.options.taps[i].type !== "sync" );
      if (unroll) {
        code += `function _next${i}() {\n`;
        code += current();
        code += `}\n`;
        current = () => `_next${i}();\n`;
      }
      const done = current;
      const content = this.callTap(i, { onDone: done });
      current = () => content;
    }
    code += current();
    return code;
  }

  /**
   * 并行调用所有 tap，生成并行执行的代码
   * @returns {string}
   */
  callTapsParallel({ onDone }) {
    let code = `var _counter = ${this.options.taps.length};\n`;
    code += `
      var _done = function () {
          if (--_counter === 0) ${onDone()};
      };
    `;
    for (let j = 0; j < this.options.taps.length; j++) {
      const content = this.callTap(j, { onDone: () => `_done();\n` });
      code += content;
    }
    return code;
  }

  /**
   * 生成调用单个 tap 的代码
   * @param {number} tapIndex
   * @returns {string}
   */
  callTap(tapIndex, { onDone } = {}) {
    let code = "";
    code += `var _fn${tapIndex} = _x[${tapIndex}];\n`
    let tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        // 生成同步调用代码
        code += `
          _fn${tapIndex}(${this.args()});
        `;
        if (onDone) {
          code += onDone();
        }
        break;
      case 'async':
        let cbCode = `(function() {\n`;
        if (onDone) cbCode += onDone();
        cbCode += `})`;
        code += `_fn${tapIndex}(${this.args({
          after: cbCode
        })});`;
        break;
      case 'promise':
        code += `
          var _promise${tapIndex} = _fn${tapIndex}(${this.args()});
          _promise${tapIndex}.then(
            function () {
              ${onDone()};
            }
          );
        `;
        break;
      default:
        break;
    }
    return code;
  }
}

module.exports = HookCodeFactory;