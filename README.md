# hereby-tools

`hereby-tools` is a small, opinionated set of helpers for
[`hereby`](https://github.com/jakebailey/hereby) task files. It keeps common
task plumbing—running local commands, removing generated directories, and
building namespaced task groups—consistent across projects.

The package is ESM-only and requires Node.js 22 or newer.

## Installation

Install `hereby` alongside this package because it is a peer dependency:

```sh
npm install --save-dev hereby hereby-tools
```

## `taskP`

`taskP` wraps `hereby`'s `task` function and passes two project-aware helpers
to the task's `run` callback:

- `exec(label, options?)` creates an
  [`execa`](https://github.com/sindresorhus/execa) command runner. It prefers
  executables from the project's local `node_modules/.bin` and prefixes stdout
  and stderr with the task name, label, and stream name.
- `rmRf(path)` recursively removes a file or directory. Relative paths are
  resolved from the process's current working directory.

```js
// Herebyfile.mjs
import { taskP } from 'hereby-tools';

export const clean = taskP({
	name: 'clean',
	description: 'Remove generated files',
	run: async ({ rmRf }) => {
		await rmRf('dist');
	}
});

export const build = taskP({
	name: 'build',
	description: 'Compile the project',
	dependencies: [clean],
	run: async ({ exec }) => {
		await exec('typescript')`tsc --build`;
	}
});

export default build;
```

Command options supported by the text-output form of Execa can be supplied as
the second argument. The helper manages `stdout`, `stderr`, and `stdio` itself.

```js
await exec('tests', {
	cwd: 'packages/api',
	env: { NODE_ENV: 'test' }
})`vitest run`;
```

Output is formatted like this:

```text
[build:exec:typescript:stdout] ...
[build:exec:typescript:stderr] ...
```

## `createSubmodule`

`createSubmodule(prefix, definitions)` creates a group of `taskP` tasks whose
names use the form `<prefix>:<key>`. Use `moduleDependencies` to refer to other
tasks in the same group by key. Regular `dependencies` can still contain tasks
defined elsewhere.

```js
// Herebyfile.mjs
import { createSubmodule } from 'hereby-tools';

const api = createSubmodule('api', {
	clean: {
		description: 'Clean API output',
		run: async ({ rmRf }) => {
			await rmRf('packages/api/dist');
		}
	},
	build: {
		description: 'Build the API',
		moduleDependencies: ['clean'],
		run: async ({ exec }) => {
			await exec('typescript', {
				cwd: 'packages/api'
			})`tsc --build`;
		}
	},
	test: {
		description: 'Test the API',
		moduleDependencies: ['build'],
		run: async ({ exec }) => {
			await exec('vitest', {
				cwd: 'packages/api'
			})`vitest run`;
		}
	}
});

export const apiClean = api.clean;
export const apiBuild = api.build;
export const apiTest = api.test;
export default api.test;
```

The resulting task names are `api:clean`, `api:build`, and `api:test`:

```sh
npx hereby api:build
npx hereby api:test
```

Unknown or circular `moduleDependencies` are rejected while the task group is
created.

## Development

```sh
npm run build
npm run typecheck
npm run lint
```

## License

MIT
