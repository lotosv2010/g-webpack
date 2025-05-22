// const { SyncHook, HookMap } = require('tapable');
const { SyncHook, HookMap } = require('../../tapable');
debugger
const keyedHookMap = new HookMap(() => new SyncHook(["name", "age"]));

keyedHookMap.for('key1').tap('plugin1', (name, age) => { console.log('plugin1', name, age); });
keyedHookMap.for('key1').tap('plugin2', (name, age) => { console.log('plugin2', name, age); });
keyedHookMap.for('key2').tap('plugin3', (name, age) => { console.log('plugin3', name, age); });

keyedHookMap.get('key1').call('HookMap', 18);
keyedHookMap.get('key2').call('HookMap', 28);