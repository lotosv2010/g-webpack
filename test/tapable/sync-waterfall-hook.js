const { SyncWaterfallHook } = require('tapable');

const hook = new SyncWaterfallHook(['name', 'age']);

hook.tap('1', (name, age) => {
  console.log(1, name, age);
  // 如果返回值不为undefined，则返回值作为参数传递给下一个函数
  return 1;
});

hook.tap('2', (name, age) => {
  console.log(2, name, age);
  //  如果返回值为undefined，参数将传递给下一个函数
});

hook.tap('3', (name, age) => {
  console.log(3, name, age);
  return 3;
});

hook.call('SyncWaterfallHook', 18);