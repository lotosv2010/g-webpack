// const { AsyncParallelHook } = require("tapable");
const { AsyncParallelHook } = require("../../tapable");

//! 1.同步注册
const queue = new AsyncParallelHook(["name"]);

console.time("cost");
queue.tap("1", function (name) {
  console.log(1);
});
queue.tap("2", function (name) {
  console.log(2);
});
queue.tap("3", function (name) {
  console.log(3);
});
queue.callAsync("AsyncParallelHook", (err) => {
  console.log(err);
  console.timeEnd("cost");
});

//! 2.异步注册
const AsyncQueue = new AsyncParallelHook(["name", "age"]);

console.time('async cost');
AsyncQueue.tapAsync('1', (name, age, callback) => {
  setTimeout(() => {
    console.log(1, name, age);
    callback();
  }, 1000);
});
AsyncQueue.tapAsync('2', (name, age,callback) => {
  setTimeout(() => {
    console.log(2, name, age);
    callback();
  }, 2000);
});
AsyncQueue.tapAsync('3', (name, age,callback) => {
  setTimeout(() => {
    console.log(3, name, age);
    callback();
  }, 3000);
});
debugger
AsyncQueue.callAsync('AsyncParallelHook', 10, (err) => {
  console.log(err);
  console.timeEnd('async cost');
});

//! 3.promise注册
// let promiseQueue = new AsyncParallelHook(["name"]);

// console.time("promise cost");
// promiseQueue.tapPromise("1", function (name) {
//   return new Promise(function (resolve, reject) {
//     setTimeout(function () {
//       console.log(1);
//       resolve();
//     }, 1000);
//   });
// });
// promiseQueue.tapPromise("2", function (name) {
//   return new Promise(function (resolve, reject) {
//     setTimeout(function () {
//       console.log(2);
//       resolve();
//     }, 2000);
//   });
// });
// promiseQueue.tapPromise("3", function (name) {
//   return new Promise(function (resolve, reject) {
//     setTimeout(function () {
//       console.log(3);
//       resolve();
//     }, 3000);
//   });
// });
// promiseQueue.promise("AsyncParallelHook").then(() => {
//   console.timeEnd("promise cost");
// });