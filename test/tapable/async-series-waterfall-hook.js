const { AsyncSeriesWaterfallHook } = require("tapable");

//! 1.同步注册
const queue = new AsyncSeriesWaterfallHook(["name", "age"]);

console.time("cost");
queue.tap("1", function (name, age) {
  console.log(1, name, age);
  return "return1";
});
queue.tap("2", function (data, age) {
  console.log(2, data, age);
  return "return2";
});
queue.tap("3", function (data, age) {
  console.log(3, data, age);
});
queue.callAsync("AsyncSeriesWaterfallHook", 10, (err) => {
  console.log(err);
  console.timeEnd("cost");
});

//! 2.异步注册
const AsyncQueue = new AsyncSeriesWaterfallHook(["name", "age"]);

console.time("async cost");
AsyncQueue.tapAsync("1", function (name, age, callback) {
  setTimeout(function () {
    console.log(1, name, age);
    callback(null, 1);
  }, 1000);
});
AsyncQueue.tapAsync("2", function (data, age, callback) {
  setTimeout(function () {
    console.log(2, data, age);
    callback(null, 2);
  }, 2000);
});
AsyncQueue.tapAsync("3", function (data, age, callback) {
  setTimeout(function () {
    console.log(3, data, age);
    callback(null, 3);
  }, 3000);
});
AsyncQueue.callAsync("AsyncSeriesWaterfallHook", 10, (err, data) => {
  console.log(err, data);
  console.timeEnd("async cost");
});

//! 3.promise注册
const promiseQueue = new AsyncSeriesWaterfallHook(["name", "age"]);

console.time("promise cost");
promiseQueue.tapPromise("1", function (name, age) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(1, name, age);
      resolve(1);
    }, 1000);
  });
});
promiseQueue.tapPromise("2", function (data, age) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(2, data, age);
      resolve(2);
    }, 2000);
  });
});
promiseQueue.tapPromise("3", function (data, age) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(3, data, age);
      resolve(3);
    }, 3000);
  });
});
promiseQueue.promise("AsyncSeriesWaterfallHook", 10).then((err) => {
  console.timeEnd("promise cost");
});