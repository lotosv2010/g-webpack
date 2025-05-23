const InitFragment = require("../InitFragment");
class HarmonyExportInitFragment extends InitFragment {
	constructor(
		exportsArgument,
		exportMap = EMPTY_MAP
	) {
		super();
		this.exportsArgument = exportsArgument;
		this.exportMap = exportMap;
	}
	getContent() {
		const definitions = [];
		definitions.push(`"default": () => (__WEBPACK_DEFAULT_EXPORT__)`);
		return `webpackRequire.d(${this.exportsArgument}, {${definitions.join(",")}\n});\n`;
	}
}
module.exports = HarmonyExportInitFragment;