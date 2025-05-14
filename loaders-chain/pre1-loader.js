function loader(source) {
  console.log("pre1");
  return source + "//pre1";
}
loader.pitch = function () {
  console.log("pitch-pre1");
};
module.exports = loader;