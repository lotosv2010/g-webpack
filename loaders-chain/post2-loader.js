function loader(source) {
  console.log("post2");
  return source + "//post2";
}
loader.pitch = function () {
  console.log("pitch-post2");
};
module.exports = loader;