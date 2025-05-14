function loader(source) {
  console.log("inline2");
  return source + "//inline2";
}
loader.pitch = function () {
  console.log("pitch-inline2");
  return "pitch-inline2";
};
module.exports = loader;