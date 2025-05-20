const { AsyncSeriesBailHook } = require("tapable");

//! 1.同步注册
const queue = new AsyncSeriesBailHook(["name"]);

console.time("cost");
queue.tap("1", function (name) {
  console.log(1);
  return "Wrong";
});
queue.tap("2", function (name) {
  console.log(2);
});
queue.tap("3", function (name) {
  console.log(3);
});
queue.callAsync("AsyncSeriesBailHook", (err) => {
  console.log(err);
  console.timeEnd("cost");
});

//! 2.异步注册
const AsyncQueue = new AsyncSeriesBailHook(["name"]);

console.time("async cost");
AsyncQueue.tapAsync("1", function (name, callback) {
  setTimeout(function () {
    console.log(1);
    callback("wrong");
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
AsyncQueue.callAsync("AsyncSeriesBailHook", (err) => {
  console.log(err);
  console.timeEnd("async cost");
});

//! 3.promise注册
const promiseQueue = new AsyncSeriesBailHook(["name"]);

console.time("promise cost");
promiseQueue.tapPromise("1", function (name) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(1);
      resolve();
    }, 1000);
  });
});
promiseQueue.tapPromise("2", function (name, callback) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(2);
      reject("失败了");
    }, 2000);
  });
});
promiseQueue.tapPromise("3", function (name, callback) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log(3);
      resolve();
    }, 3000);
  });
});
promiseQueue.promise("AsyncSeriesBailHook").then(
  (data) => {
    console.log(data);
    console.timeEnd("promise cost");
  },
  (error) => {
    console.log(error);
    console.timeEnd("promise cost");
  }
);