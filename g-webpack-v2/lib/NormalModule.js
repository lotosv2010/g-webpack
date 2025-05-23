const { RawSource } = require("webpack-sources");
const { runLoaders } = require("loader-runner");
const Module = require("./Module");
const { contextify } = require("./util/identifier");
const asString = input => {
	if (Buffer.isBuffer(input)) {
		return input.toString("utf-8");
	}
	return input;
};
class NormalModule extends Module {
	constructor({ context, request, userRequest, rawRequest, resource, parser, generator }) {
		super('javascript/auto');
		this.context = context;
		this.request = request;
		this.userRequest = userRequest;
		this.rawRequest = rawRequest;
		this.resource = resource;
		this.parser = parser;
		this.generator = generator;
		this._source = null;
	}
	identifier() {
		return this.request;
	}
	originalSource() {
		return this._source;
	}
	build(options, compilation, resolver, fs, callback) {
		return this._doBuild(options, compilation, resolver, fs, err => {
			const source = this._source.source();
			this.parser.parse(source, {
				module: this
			});
			return callback(err)
		})
	}
	createSource(content) {
		return new RawSource(content);
	}
	_doBuild(options, compilation, resolver, fs, callback) {
		const loaderContext = {
			resolver,
			options,
			compilation,
			fs,
		};
		const processResult = (err, result) => {
			const source = result[0];
			this._source = this.createSource(asString(source));
			return callback(err);
		}
		runLoaders({
			resource: this.resource,
			loaders: [],
			context: loaderContext,
		}, (err, result) => {
			processResult(err, result.result);
		})
	}
	codeGeneration({ dependencyTemplates, codeGenerationResults }) {
		const source = this.generator.generate(this, {
			dependencyTemplates,
			codeGenerationResults
		});
		return source;
	}
	libIdent(options) {
		let ident = contextify(
			options.context,
			this.userRequest
		);
		return ident;
	}
	identifier() {
		return this.request;
	}
}
module.exports = NormalModule;