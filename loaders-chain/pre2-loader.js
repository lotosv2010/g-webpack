function loader(source) {
  console.log("pre2");
  console.log("pre2 getOptions", this.getOptions());
  return source + "//pre2";
}
loader.pitch = function () {
  console.log("pitch-pre2");
};
module.exports = loader;