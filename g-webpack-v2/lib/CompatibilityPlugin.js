const ConstDependency = require("./dependencies/ConstDependency");
class CompatibilityPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("CompatibilityPlugin", (compilation, {
			normalModuleFactory
		}) => {
			compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
		});
	}
}
module.exports = CompatibilityPlugin;