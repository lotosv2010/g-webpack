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
          this.header() + this.content()
        )
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
  callTapsSeries() {
    if (this.options.taps.length === 0) {
      return '';
    }
    let code = "";
    for (let j = 0; j < this.options.taps.length; j++) {
      const content = this.callTap(j);
      code += content;
    }
    return code;
  }

  /**
   * 并行调用所有 tap，生成并行执行的代码
   * @returns {string}
   */
  callTapsParallel() {
    let code = `var _counter = ${this.options.taps.length};\n`;
    code += `
      var _done = function () {
        _callback();
      };
    `;
    for (let j = 0; j < this.options.taps.length; j++) {
      const content = this.callTap(j);
      code += content;
    }
    return code;
  }

  /**
   * 生成调用单个 tap 的代码
   * @param {number} tapIndex
   * @returns {string}
   */
  callTap(tapIndex) {
    let code = "";
    code += `var _fn${tapIndex} = _x[${tapIndex}];\n`
    let tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        // 生成同步调用代码
        code += `_fn${tapIndex}(${this.args()});\n`;
        break;
      case 'async':
        code += `
          _fn${tapIndex}(${this.args({after:`function (_err${tapIndex}) {
            if (--_counter === 0) _done();
          }`})});
        `;
        break;
      default:
        break;
    }
    return code;
  }
}

module.exports = HookCodeFactory;