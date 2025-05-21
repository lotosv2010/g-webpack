// const { AsyncSeriesHook } = require("tapable");
const { AsyncSeriesHook } = require("../../tapable");

//! 1.同步注册
const queue = new AsyncSeriesHook(["name", "age"]);

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
queue.callAsync("AsyncSeriesHook", 10, (err) => {
  console.log(err);
  console.timeEnd("cost");
});

//! 2.异步注册
const AsyncQueue = new AsyncSeriesHook(["name", "age"]);

console.time("async cost");
AsyncQueue.tapAsync("1", function (name, age, callback) {
  setTimeout(function () {
    console.log(1, name, age);
    callback();
  }, 1000);
});
AsyncQueue.tapAsync("2", function (name, age, callback) {
  setTimeout(function () {
    console.log(2, name, age);
    callback();
  }, 2000);
});
AsyncQueue.tapAsync("3", function (name, age, callback) {
  setTimeout(function () {
    console.log(3, name, age);
    callback();
  }, 3000);
});
debugger
AsyncQueue.callAsync("AsyncSeriesHook", 18, (err) => {
  console.log(err);
  console.timeEnd("async cost");
});

//! 3.promise注册
const promiseQueue = new AsyncSeriesHook(["name", "age"]);

console.time("promise cost");
promiseQueue.tapPromise("1", function (name, age) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(1, name, age);
      resolve();
    }, 1000);
  });
});
promiseQueue.tapPromise("2", function (name, age) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(2, name, age);
      resolve();
    }, 2000);
  });
});
promiseQueue.tapPromise("3", function (name, age) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(3, name, age);
      resolve();
    }, 3000);
  });
});
debugger
promiseQueue.promise("AsyncSeriesHook", 28).then((data) => {
  console.log(data);
  console.timeEnd("promise cost");
});