class RuntimeSpecMap {
	constructor() {
		this.map = new Map();
	}
	get(runtime) {
		const entry = this.map.get(runtime);
		return entry;
	}
	has(runtime) {
		const entry = this.map.get(runtime);
		if (entry === undefined) {
			return false;
		}
		return true;
	}
	set(runtime, result) {
		this.map.set(runtime, result);
	}
}
exports.RuntimeSpecMap = RuntimeSpecMap;