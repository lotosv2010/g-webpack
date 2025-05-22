// const { SyncHook } = require('tapable');
const { SyncHook } = require('../../tapable');

const hook = new SyncHook(['name']);

debugger
hook.tap({ name: 'tap1', stage: 1 }, (name) => {
  console.log(1, name);
});
hook.tap({ name: 'tap3', stage: 3 }, (name) => {
  console.log(3, name);
});
hook.tap({ name: 'tap5', stage: 5 }, (name) => {
  console.log(5, name);
});
hook.tap({ name: 'tap2', stage: 2 }, (name) => {
  console.log(2, name);
});

hook.call('stage');

/**
 * 1 stage
 * 2 stage
 * 3 stage
 * 5 stage
 */