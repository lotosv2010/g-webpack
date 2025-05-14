function loader(source) {
  console.log("inline1");
  return source + "//inline1";
}
loader.pitch = function () {
  console.log("pitch-inline1");
};
module.exports = loader;