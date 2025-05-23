const EntryOptionPlugin = require('./EntryOptionPlugin');
const HarmonyModulesPlugin = require("./dependencies/HarmonyModulesPlugin");
const JavascriptModulesPlugin = require("./javascript/JavascriptModulesPlugin");
const CompatibilityPlugin = require("./CompatibilityPlugin");
const NamedModuleIdsPlugin = require("./ids/NamedModuleIdsPlugin");
const RuntimePlugin = require("./RuntimePlugin");
class WebpackOptionsApply {
	process(options, compiler) {
		//在此注册所有的内置插件
		compiler.outputPath = options.output.path;
		new EntryOptionPlugin().apply(compiler);
		compiler.hooks.entryOption.call(options.context, options.entry);
		new RuntimePlugin().apply(compiler);
		new CompatibilityPlugin().apply(compiler);
		new HarmonyModulesPlugin({}).apply(compiler);
		new NamedModuleIdsPlugin().apply(compiler);
		new JavascriptModulesPlugin().apply(compiler);
	}
}
module.exports = WebpackOptionsApply;