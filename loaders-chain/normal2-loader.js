function loader(source) {
  console.log("normal2");
  // 测试异步
  const callback = this.async();
  setTimeout(() => {
    callback(null, source + "//normal2");
  }, 3000);
  // return source + "//normal2";
}
loader.pitch = function () {
  console.log("pitch-normal2");
  // 测试pitch有返回值
  // return 'pitch-normal2'
};
module.exports = loader;