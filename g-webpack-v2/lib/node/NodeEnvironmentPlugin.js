
const fs = require('fs');
class NodeEnvironmentPlugin{
    apply(compiler){
        //webpack build是直接写入硬盘的
        //webpack dev server是写入内存
        //指定读取文件的模块为fs
        compiler.inputFileSystem = fs;
        //指定写入文件的模块为fs
		compiler.outputFileSystem = fs;
    }
}
module.exports = NodeEnvironmentPlugin