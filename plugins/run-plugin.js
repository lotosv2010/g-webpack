class RunPlugin {
  apply(compiler) {
    compiler.hooks.run.tapAsync("RunPlugin", (compilation, callback) => {
      console.log("run 开始编译");
      callback();
    });
  }
}
module.exports = RunPlugin;
