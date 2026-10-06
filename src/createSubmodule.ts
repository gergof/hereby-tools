import { Task } from 'hereby';

import taskP from './taskP.js';
import { SubmoduleTaskOptions } from './types.js';

const createSubmodule = (
	prefix: string,
	definitions: Record<string, SubmoduleTaskOptions>
) => {
	const tasks: Record<string, Task> = Object.create(null);

	const resolving = new Set<string>();

	const resolve = (name: string): Task => {
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
		resolve(name);
	}

	return tasks;
};

export default createSubmodule;
