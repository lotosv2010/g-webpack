function loader(source) {
  console.log("post2");
  console.log("age", this.age);
  return source + "//post2";
}
loader.pitch = function () {
  console.log("pitch-post2");
};
module.exports = loader;