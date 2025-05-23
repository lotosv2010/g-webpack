const RuntimeRequirementsDependency = require("./dependencies/RuntimeRequirementsDependency");
const DefinePropertyGettersRuntimeModule = require("./runtime/DefinePropertyGettersRuntimeModule");
const RuntimeGlobals = require("./RuntimeGlobals");
class RuntimePlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("RuntimePlugin", compilation => {
			compilation.dependencyTemplates.set(
				RuntimeRequirementsDependency,
				new RuntimeRequirementsDependency.Template()
			);
			compilation.hooks.runtimeRequirementInTree
				.for(RuntimeGlobals.definePropertyGetters)
				.tap("RuntimePlugin", chunk => {
					compilation.addRuntimeModule(
						chunk,
						new DefinePropertyGettersRuntimeModule()
					);
					return true;
				});

		});
	}
}
module.exports = RuntimePlugin;