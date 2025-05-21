/**
 * @file index.js
 * @description tapable 入口文件，导出所有钩子类型。
 */

const SyncHook = require('./SyncHook');

module.exports = {
  SyncHook,
}