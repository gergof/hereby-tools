import { Task, task, TaskOptions } from 'hereby';

import exec from './exec.js';
import log from './log.js';
import rmRf from './rmRf.js';
import { TaskPOptions } from './types.js';

const taskP = (options: TaskPOptions): Task => {
	let run: TaskOptions['run'] = undefined;

	if (options.run) {
		run = () =>
			options.run!({
				rmRf: rmRf(options.name),
				exec: exec(options.name),
				log: log(options.name)
			});
	}

	return task({
		...options,
		run
	});
};

export default taskP;
