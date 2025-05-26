const jszip = require("jszip");
const { RawSource } = require("webpack-sources");
const { Compilation } = require("webpack");

class ArchivePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("ArchivePlugin", (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        { name: "ArchivePlugin" },
        (assets) => {
          if (Object.keys(assets).length) {
            const zip = new jszip();
            for (const filename in assets) {
              const source = assets[filename].source();
              zip.file(filename, source);
            }
            return zip
              .generateAsync({ type: "nodebuffer" })
              .then((zipContent) => {
                assets[`archive_${Date.now()}.zip`] = new RawSource(zipContent);
              });
          }
          return Promise.resolve(assets);
        }
      );
    });
  }
}

module.exports = ArchivePlugin;
