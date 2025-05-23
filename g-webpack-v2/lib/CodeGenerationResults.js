class CodeGenerationResults {
	constructor() {
		this.map = new Map();
	}
	get(module) {
		const result = this.map.get(module);
		if (result === undefined) {
			return undefined;
		}
		return result;
	}
	has(module) {
		const result = this.map.get(module);
		if (result === undefined) {
			return false;
		}
		return true;
	}
	set(module, result) {
		this.map.set(module, result);
	}
}
module.exports = CodeGenerationResults;