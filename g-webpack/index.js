const Compiler = require("./Compiler");

function webpack(config) {
  const argv = process.argv.slice(2);
  const shellOptions = argv.reduce((shellOptions, options) => {
    const [key, value] = options.split("=");
    shellOptions[key.slice(2)] = value;
    return shellOptions;
  }, {});
  const finalOptions = { ...config, ...shellOptions };
  const compiler = new Compiler(finalOptions);
  finalOptions.plugins.forEach((plugin) => {
    plugin.apply(compiler);
  });
  return compiler;
}
module.exports = webpack;
