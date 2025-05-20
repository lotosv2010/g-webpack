const { SyncBailHook } = require('tapable');

const hook = new SyncBailHook(['name', 'age']);

hook.tap('1', (name, age) => {
  console.log(1, name, age);
});

hook.tap('2', (name, age) => {
  console.log(2, name, age);
  // 如果返回值不为 undefined，则终止执行
  return 2;
});

hook.tap('3', (name, age) => {
  console.log(3, name, age);
});

hook.call('SyncBailHook', 18);