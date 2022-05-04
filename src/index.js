let Watcher = require('./watcher');

/**
 * @type {{hooks: {watchRun: {tap: Function}, watchClose: {tap: Function}, failed: {tap: Function}, done: {tap: Function}}}}
 */
class CssVariablesExtract {
	constructor(source, savePath, stage = ['watchRun', 'watchClose', 'failed', 'done']) {
		this.source = source;
		this.savePath = savePath;
		this.stage = stage;
		this.watcher = new Watcher();
	}

	apply(compiler) {
		this.watcher.addWatcher(this.source);
		this.stage.map(stage => compiler.hooks[stage].tap('CssVariablesWatchPlugin', () => {
			this.watcher.conditionalRemove(stage);
		}));
	}
}

module.exports = CssVariablesExtract;