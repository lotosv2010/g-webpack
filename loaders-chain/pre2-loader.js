function loader(source) {
  console.log("pre2");
  return source + "//pre2";
}
loader.pitch = function () {
  console.log("pitch-pre2");
};
module.exports = loader;