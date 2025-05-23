const { HookMap, SyncHook } = require("tapable");
const fs = require("fs");
const Factory = require("enhanced-resolve").ResolverFactory;//require.resolve
class ResolverFactory {
	constructor() {
		this.hooks = {
			resolver: new HookMap(
				() => new SyncHook(["resolver"])
			)
		};
	}
	get(type) {
		const newResolver = this._create(type);
		return newResolver;
	}
	_create(type) {
		const options = {
			mainFields: ["browser", "module", "main"],
			extensions: [".js", ".json", ".wasm"],
			mainFiles: ["index"],
			fileSystem: fs
		}
		const resolver = Factory.createResolver(options);
		this.hooks.resolver.for(type).call(resolver);
		return resolver;
	}
}
module.exports = ResolverFactory;