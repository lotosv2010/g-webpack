const { AsyncParallelBailHook } = require("tapable");

//! 1.同步注册
const queue = new AsyncParallelBailHook(["name"]);

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
queue.callAsync("AsyncParallelBailHook", (err) => {
  console.log(err);
  console.timeEnd("cost");
});

//! 2.异步注册
const AsyncQueue = new AsyncParallelBailHook(["name"]);

console.time("async cost");
AsyncQueue.tapAsync("1", function (name, callback) {
  console.log(1);
  callback("Wrong");
});
AsyncQueue.tapAsync("2", function (name, callback) {
  console.log(2);
  callback();
});
AsyncQueue.tapAsync("3", function (name, callback) {
  console.log(3);
  callback();
});
AsyncQueue.callAsync("AsyncParallelBailHook", (err) => {
  console.log(err);
  console.timeEnd("async cost");
});

//! 3.promise注册
let promiseQueue = new AsyncParallelBailHook(["name"]);

console.time("promise cost");
promiseQueue.tapPromise("1", function (name) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(1);
      //对于promise来说，resolve还reject并没有区别
      //区别在于你是否传给它们的参数
      resolve(1);
    }, 1000);
  });
});
promiseQueue.tapPromise("2", function (name) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(2);
      resolve();
    }, 2000);
  });
});

promiseQueue.tapPromise("3", function (name) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(3);
      resolve();
    }, 3000);
  });
});

promiseQueue.promise("AsyncParallelBailHook").then(
  (result) => {
    console.log("成功", result);
    console.timeEnd("promise cost");
  },
  (err) => {
    console.error("失败", err);
    console.timeEnd("promise cost");
  }
);