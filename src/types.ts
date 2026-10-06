import { Task } from 'hereby';

import { Exec } from './exec.js';
import { RmRf } from './rmRf.js';

export interface RunPTools {
	rmRf: RmRf;
	exec: Exec;
}

export interface TaskPOptions {
	name: string;
	description?: string | undefined;
	dependencies?: readonly Task[] | undefined;
	run?:
		| ((tools: RunPTools) => void)
		| ((tools: RunPTools) => PromiseLike<void>)
		| undefined;
	hiddenFromTaskList?: boolean | undefined;
}

export interface SubmoduleTaskOptions<TaskName extends string> extends Omit<
	TaskPOptions,
	'name'
> {
	moduleDependencies?: TaskName[] | undefined;
}
