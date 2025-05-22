// const {SyncHook} = require('tapable');
const { SyncHook } = require('../../tapable');

let hook = new SyncHook(['name']);

debugger
hook.tap({ name: 'tap1' }, (name) => {
  console.log(1, name);
});
hook.tap({ name: 'tap3' }, (name) => {
  console.log(3, name);
});
hook.tap({ name: 'tap5' }, (name) => {
  console.log(5, name);
});
hook.tap({ name: 'tap2', before: ['tap3', 'tap5'] }, (name) => {
  console.log(2, name);
});

hook.call('before');

/**
 * 1 before
 * 2 before
 * 3 before
 * 5 before
 */