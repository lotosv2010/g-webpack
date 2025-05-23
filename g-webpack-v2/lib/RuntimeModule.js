const { RawSource } = require("webpack-sources");
const Module = require("./Module");
class RuntimeModule extends Module {
	constructor(name) {
		super("runtime");
		this.name = name;
	}
	identifier() {
		return `webpack/runtime/${this.name}`;
	}
	codeGeneration(context) {
		const sources = new Map();
		const generatedCode = this.getGeneratedCode();
		if (generatedCode) {
			sources.set("runtime", new RawSource(generatedCode));
		}
		return {
			sources,
			runtimeRequirements: null
		};
	}
	getGeneratedCode() {
		return this.generate();
	}
	generate() {
		const AbstractMethodError = require("./AbstractMethodError");
		throw new AbstractMethodError();
	}
}
module.exports = RuntimeModule;