// const { AsyncParallelHook } = require("tapable");
const { AsyncParallelHook } = require("../../tapable");

//! 1.同步注册
const queue = new AsyncParallelHook(["name", "age"]);

console.time("cost");
queue.tap("1", function (name, age) {
  console.log(1, name, age);
});
queue.tap("2", function (name, age) {
  console.log(2, name, age);
});
queue.tap("3", function (name, age) {
  console.log(3, name, age);
});
debugger
queue.callAsync("AsyncParallelHook", 18, (err) => {
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
const promiseQueue = new AsyncParallelHook(["name", "age"]);

console.time("promise cost");
promiseQueue.tapPromise("1", function (name, age) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(1, name, age);
      resolve();
    }, 1000);
  });
});
promiseQueue.tapPromise("2", function (name, age) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(2, name, age);
      resolve();
    }, 2000);
  });
});
promiseQueue.tapPromise("3", function (name, age) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(3, name, age);
      resolve();
    }, 3000);
  });
});
debugger
promiseQueue.promise("AsyncParallelHook", 28).then(() => {
  console.timeEnd("promise cost");
});