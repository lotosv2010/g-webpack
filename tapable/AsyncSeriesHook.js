/**
 * @file AsyncSeriesHook.js
 * @description 定义异步串行钩子 AsyncSeriesHook 及其工厂，支持注册和并行执行 tap 回调。
 */

const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

/**
 * 异步串行钩子的代码工厂，继承自 HookCodeFactory
 * 负责生成并执行所有 tap 回调
 */
class AsyncSeriesHookCodeFactory extends HookCodeFactory {
  /**
   * 生成并执行所有 tap 回调
   * @param {Object} options - 钩子选项
   * @param {Function} options.onDone - 所有 tap 回调执行完毕后的回调函数
   * @returns {string} 生成的代码
   */
  content({ onDone }) {
    // 调用父类 callTapsSeries 方法生成并执行所有 tap 回调
    return this.callTapsSeries({ onDone });
  }
}

// 创建异步串行钩子的代码工厂
const factory = new AsyncSeriesHookCodeFactory();

/**
 * 异步串行钩子 AsyncSeriesHook 继承自 Hook
 * 支持注册和并行执行 tap 回调
 */
class AsyncSeriesHook extends Hook {
  /**
   * 编译钩子，生成最终的调用函数
   * @param {Object} options - 编译选项
   * @returns {Function} 返回生成的调用函数
   */
  compile(options) {
    // 置工厂的上下文
    factory.setup(this, options);
    // 创建最终的钩子执行函数
    return factory.create(options);
  }
}
module.exports = AsyncSeriesHook;