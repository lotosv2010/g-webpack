
const EntryDependency = require("./dependencies/EntryDependency");
class EntryPlugin{
    constructor(context, entry, options) {
		this.context = context;//根目录
		this.entry = entry;//入口文件路径
		this.options = options || {};//选项
	}
    apply(compiler){
        //监听compilation钩子
        //当我们开始一次新的编译，就会创建一个新的compilation,触发compilation钩子
        //参数对象里有一个属性normalModuleFactory，代表生产模块工厂
        compiler.hooks.compilation.tap(
			"EntryPlugin",
			(compilation, { normalModuleFactory }) => {
                //this.hooks.compilation.call(compilation, params);
                //注册入口依赖和对应的工厂关系
                //moduleA import moduleB,moduleB会成为moduleA的依赖
                //当编译完moduleA的时候，找到moduleA的依赖moduleBDependency
                //然后要到这个dependencyFactories找对应的工作，把依赖传进去，生成对应的moduleB模块
                //webpack里有多种依赖，有多种模块工厂，每个依赖会对应一个生产模块的工厂
				compilation.dependencyFactories.set(
                    //入口依赖要通过normalModuleFactory来生产对应的入口模块
					EntryDependency,
					normalModuleFactory
				);
                const { entry, options, context } = this;
                //调用静态方法通过entry得到一个依赖实例
                const dep = EntryPlugin.createDependency(entry, options);
                //注册make钩子回调，等待make事件的触发
                //this.hooks.make.callAsync(compilation)
                compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
                    compilation.addEntry(context, dep, options, err => {
                        callback(err);
                    });
                });
			}
		);
    }
    static createDependency(entry) {
        //webpack5依赖是115种
		return new EntryDependency(entry);
	}
}
module.exports = EntryPlugin;