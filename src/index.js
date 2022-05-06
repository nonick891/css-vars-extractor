let FileWatcher =  require('./file-watcher'),
	StyleReader = require('./style-reader'),
	{ getExtName } = require('file-oprtr');

/**
 * @type {{hooks: {watchRun: {tap: Function}, watchClose: {tap: Function}, failed: {tap: Function}, done: {tap: Function}}}}
 */
class CssVariablesExtract {
	constructor(source, savePath, stage = ['watchRun', 'watchClose', 'failed', 'done']) {
		this.source = source;
		this.savePath = savePath;
		this.stage = stage;
		this.watcher = new FileWatcher();
		this.reader = (new StyleReader(source)).setSourceFiles();
	}

	apply(compiler) {
		this.reader.getAll();
		compiler.hooks.watchRun.tap('CssVariablesWatchPlugin', () => {
			this.watcher.addWatcher(
				this.source,
				filename => this.reader.getVariables(filename),
				name => !(/\.s[ac]ss$/i.test(getExtName(name))));
		});
		this.stage.map(stage => compiler.hooks[stage].tap('CssVariablesWatchPlugin', () =>
			this.watcher.remove(stage))
		);
	}
}

module.exports = CssVariablesExtract;