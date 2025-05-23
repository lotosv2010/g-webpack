const {
	AsyncSeriesBailHook,
	SyncBailHook,
	SyncHook,
	HookMap,
	SyncWaterfallHook
} = require('tapable');
const { getContext } = require("loader-runner");
const NormalModule = require('./NormalModule');
class NormalModuleFactory {
	constructor({
		resolverFactory
	}) {
		this.resolverFactory = resolverFactory;
		this.hooks = {
			factorize: new AsyncSeriesBailHook(["resolveData"]),
			beforeResolve: new AsyncSeriesBailHook(["resolveData"]),
			afterResolve: new AsyncSeriesBailHook(["resolveData"]),
			createModule: new AsyncSeriesBailHook(["createData", "resolveData"]),
			module: new SyncWaterfallHook(["module", "createData", "resolveData"]),
			createParser: new HookMap(() => new SyncBailHook([])),
			parser: new HookMap(() => new SyncHook(["parser"])),
			createGenerator: new HookMap(() => new SyncBailHook([])),
			generator: new HookMap(() => new SyncHook(["generator"])),
			resolve: new AsyncSeriesBailHook(["resolveData"])
		};
		this.hooks.resolve.tapAsync("NormalModuleFactory", (data, callback) => {
			const { context, request } = data;
			const normalResolver = this.getResolver('normal');
			this.resolveResource(context, request, normalResolver, (err, resolvedResource) => {
				let resourceData = {
					resource: resolvedResource
				};
				const userRequest = resourceData.resource;
				const type = 'javascript/auto';
				Object.assign(data.createData, {
					request,
					rawRequest: request,
					userRequest: userRequest,
					resource: resourceData.resource,
					context: resourceData.context || getContext(resourceData.resource),
					settings: {
						type
					},
					type,
					parser: this.getParser(type),
					generator: this.getGenerator(type)
				});
				callback();
			});
		});
		this.hooks.factorize.tapAsync("NormalModuleFactory", (resolveData, callback) => {
			this.hooks.resolve.callAsync(resolveData, (err, result) => {
				this.hooks.afterResolve.callAsync(resolveData, (err, result) => {
					const createData = resolveData.createData;
					this.hooks.createModule.callAsync(createData, resolveData, (err, createdModule) => {
						createdModule = new NormalModule(createData);
						createdModule = this.hooks.module.call(createdModule, createData, resolveData);
						return callback(null, createdModule);
					});
				});
			});
		});
	}
	getParser(type) {
		let parser = this.createParser(type);
		return parser;
	}
	createParser(type) {
		const parser = this.hooks.createParser.for(type).call();
		this.hooks.parser.for(type).call(parser);
		return parser;
	}
	getGenerator(type) {
		let generator = this.createGenerator(type);
		return generator;
	}
	createGenerator(type) {
		const generator = this.hooks.createGenerator.for(type).call();
		this.hooks.generator.for(type).call(generator);
		return generator;
	}
	resolveResource(context, request, resolver, callback) {
		const contextInfo = {};
		const resolveContext = {};
		resolver.resolve(contextInfo, context, request, resolveContext, (err, resolvedResource) => {
			callback(err, resolvedResource);
		});
	}
	getResolver(type) {
		return this.resolverFactory.get(type);
	}
	create(data, callback) {
		const dependencies = data.dependencies;
		const context = data.context;
		const dependency = dependencies[0];
		const request = dependency.request;
		const resolveData = {
			context,
			request,
			createData: {}
		};
		this.hooks.beforeResolve.callAsync(resolveData, (err, result) => {
			this.hooks.factorize.callAsync(resolveData, (err, module) => {
				const factoryResult = {
					module
				};
				callback(err, factoryResult);
			});
		});
	}
}
module.exports = NormalModuleFactory;