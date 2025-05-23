const replacePathVariables = (path) => {
	return path;
}
class TemplatedPathPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap(plugin, compilation => {
			compilation.hooks.assetPath.tap(plugin, replacePathVariables);
		});
	}
}
module.exports = TemplatedPathPlugin;