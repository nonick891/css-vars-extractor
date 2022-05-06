let { watchFolder } = require('file-oprtr');

module.exports = class FileWatcher {

	bag = {};

	doneStage = 'done';

	stopStage = ['watchClose', 'failed'];

	constructor(folder) {
		this.folder = folder;
	}

	/**
	 *
	 * @param {string} folder
	 * @param {function(path, stat)} handler
	 * @param {function(path, stat):boolean} exitCond
	 * @returns {boolean}
	 */
	addWatcher(folder, handler, exitCond = ()=>{}) {
		this.folder = folder ? folder : this.folder;
		if (!this.folder || this.bag[this.folder]) return false;
		this.bag[this.folder] = watchFolder({
			folder: this.folder, create: handler,
			update: handler, error: handler,
			exitCond
		});
	}

	remove(stage) {
		if (!this.isStop(stage)) return;
		this.removeWatchers();
	}

	isStop(stage) {
		return this.isDone(stage)
			|| this.stopStage.indexOf(stage) > -1;
	}

	isDone(stage) {
		return stage === this.doneStage
			&& process.argv.indexOf('--build') > -1
	}

	removeWatchers() {
		Object.keys(this.bag).map(folder =>
			this.bag[folder].close()
		);
	}
}