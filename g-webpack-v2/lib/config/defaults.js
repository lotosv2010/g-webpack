

const F = (obj, prop, factory) => {
	if (obj[prop] === undefined) {
		obj[prop] = factory();
	}
};
/**
 * 应用默认值
 * @param {*} options 
 */
const applyWebpackOptionsBaseDefaults = options => {
    //context指就是项目的根目录,默认值是命令所在的目录
    //options.context=process.cwd()
	F(options, "context", () => process.cwd());
};

const applyWebpackOptionsDefaults = options => {
	F(options, "context", () => process.cwd());
}
exports.applyWebpackOptionsBaseDefaults = applyWebpackOptionsBaseDefaults;
exports.applyWebpackOptionsDefaults=applyWebpackOptionsDefaults;