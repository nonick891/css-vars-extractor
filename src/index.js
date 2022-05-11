let FileWatcher =  require('./file-watcher'),
	StyleReader = require('./style-reader'),
	FileSaver = require('./file-saver'),
	{ getExtName } = require('file-oprtr');

/**
 * @type {{hooks: {watchRun: {tap: Function}, watchClose: {tap: Function}, failed: {tap: Function}, done: {tap: Function}}}}
 */
class CssVariablesExtract {
	constructor({ source,
        rootSelector = '.root',
        fileName = 'variables',
        stage = ['watchRun', 'watchClose', 'failed', 'done']
	}) {
		this.source = source;
		this.stage = stage;
		this.saver = new FileSaver({ fileName, rootSelector });
		this.watcher = new FileWatcher();
		this.reader = (new StyleReader(source)).setSourceFiles();
	}

	apply(compiler) {
		this.reader.getAll();
		this.saver.saveFiles(this.reader.variables);
		this.watchFiles(compiler);
		this.removeWatcher(compiler);
	}

	watchFiles(compiler) {
		let exitCond = name => name.indexOf(this.saver.getFileName()) > -1
				|| !(/\.s[ac]ss$/i.test(getExtName(name))),
			updateFiles = name => {
				this.reader.setVariables(name);
				this.saver.saveFiles(this.reader.variables, [name]);
			};
		compiler.hooks.watchRun.tap('CssVariablesWatchPlugin', () =>
			this.watcher.addWatcher(this.source, updateFiles, exitCond)
		);
	}

	removeWatcher(compiler) {
		this.stage.map(stage => compiler.hooks[stage].tap('CssVariablesWatchPlugin', () =>
			this.watcher.remove(stage))
		);
	}
}

module.exports = CssVariablesExtract;