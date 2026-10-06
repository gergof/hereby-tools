import { Task } from 'hereby';

import taskP from './taskP.js';
import { SubmoduleTaskOptions } from './types.js';

const createSubmodule = <TaskName extends string>(
	prefix: string,
	definitions: Record<TaskName, SubmoduleTaskOptions<NoInfer<TaskName>>>
) => {
	const tasks: Record<TaskName, Task> = Object.create(null);

	const resolving = new Set<string>();

	const resolve = (name: TaskName): Task => {
		if (tasks[name]) {
			return tasks[name];
		}

		if (!Object.hasOwn(definitions, name)) {
			throw new Error(`Unknown task "${name}" in submodule "${prefix}".`);
		}

		const definition = definitions[name]!;

		if (resolving.has(name)) {
			throw new Error(
				`Circular task dependency involving "${name}" in "${prefix}".`
			);
		}

		resolving.add(name);

		const { moduleDependencies = [], ...options } = definition;

		const resolvedModuleDependencies = moduleDependencies.map(dependency =>
			resolve(dependency)
		);

		tasks[name] = taskP({
			...options,
			name: `${prefix}:${name}`,
			dependencies: [
				...(options.dependencies || []),
				...resolvedModuleDependencies
			]
		});

		resolving.delete(name);

		return tasks[name];
	};

	for (const name of Object.keys(definitions)) {
		resolve(name as TaskName);
	}

	return tasks;
};

export default createSubmodule;
