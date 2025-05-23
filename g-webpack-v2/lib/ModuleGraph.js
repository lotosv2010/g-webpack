
const ModuleGraphConnection = require("./ModuleGraphConnection");
class ModuleGraphModule {
	constructor() {
		this.incomingConnections = new Set();
		this.outgoingConnections = undefined;
	}
}

class ModuleGraph {
	constructor() {
		this._dependencyMap = new WeakMap();
		this._moduleMap = new Map();
	}
	setResolvedModule(originModule, dependency, module) {
		const connection = new ModuleGraphConnection(
			originModule,
			dependency,
			module
		);
		const connections = this._getModuleGraphModule(module).incomingConnections;
		connections.add(connection);
		if (originModule) {
			const mgm = this._getModuleGraphModule(originModule);
			if (mgm.outgoingConnections === undefined) {
				mgm.outgoingConnections = new Set();
			}
			mgm.outgoingConnections.add(connection);
		} else {
			this._dependencyMap.set(dependency, connection);
		}
	}
	_getModuleGraphModule(module) {
		let mgm = this._moduleMap.get(module);
		if (mgm === undefined) {
			mgm = new ModuleGraphModule();
			this._moduleMap.set(module, mgm);
		}
		return mgm;
	}
	getModule(dependency) {
		const connection = this.getConnection(dependency);
		return connection !== undefined ? connection.module : null;
	}
	getConnection(dependency) {
		const connection = this._dependencyMap.get(dependency);
		return connection === null ? undefined : connection;
	}
}
module.exports = ModuleGraph;