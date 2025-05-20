const { AsyncSeriesHook } = require("tapable");

//! 1.同步注册
const queue = new AsyncSeriesHook(["name"]);

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
queue.callAsync("AsyncSeriesHook", (err) => {
  console.log(err);
  console.timeEnd("cost");
});

//! 2.异步注册
const AsyncQueue = new AsyncSeriesHook(["name"]);

console.time("async cost");
AsyncQueue.tapAsync("1", function (name, callback) {
  setTimeout(function () {
    console.log(1);
  }, 1000);
});
AsyncQueue.tapAsync("2", function (name, callback) {
  setTimeout(function () {
    console.log(2);
    callback();
  }, 2000);
});
AsyncQueue.tapAsync("3", function (name, callback) {
  setTimeout(function () {
    console.log(3);
    callback();
  }, 3000);
});
AsyncQueue.callAsync("AsyncSeriesHook", (err) => {
  console.log(err);
  console.timeEnd("async cost");
});

//! 3.promise注册
const promiseQueue = new AsyncSeriesHook(["name"]);

console.time("promise cost");
promiseQueue.tapPromise("1", function (name) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(1, name);
      resolve();
    }, 1000);
  });
});
promiseQueue.tapPromise("2", function (name) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(2, name);
      resolve();
    }, 2000);
  });
});
promiseQueue.tapPromise("3", function (name) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(3, name);
      resolve();
    }, 3000);
  });
});
promiseQueue.promise("AsyncSeriesHook").then((data) => {
  console.log(data);
  console.timeEnd("promise cost");
});