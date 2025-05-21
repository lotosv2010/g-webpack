/**
 * @file index.js
 * @description tapable 入口文件，导出所有钩子类型。
 */

const SyncHook = require('./SyncHook');
const AsyncParallelHook = require('./AsyncParallelHook');
const AsyncSeriesHook = require('./AsyncSeriesHook');

module.exports = {
  SyncHook, // 同步钩子
  AsyncParallelHook, // 异步并行钩子
  AsyncSeriesHook, // 异步串行钩子
}