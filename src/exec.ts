import { execa, type Options } from 'execa';

type TextOptions = Extract<Options, { readonly encoding?: 'utf8' | 'utf16le' }>;

type ExecOptions = Omit<TextOptions, 'stderr' | 'stdio' | 'stdout'>;

const exec =
	(taskName: string) =>
	(label: string, opts: ExecOptions = {}) => {
		const prefix = (type: string) =>
			function* (line: string) {
				yield `[${taskName}:exec:${label}:${type}] ${line}`;
			};

		const execaOptions = {
			...opts,
			preferLocal: true,
			stdout: [prefix('stdout'), 'inherit'] as const,
			stderr: [prefix('stderr'), 'inherit'] as const
		} satisfies Options;

		return execa(execaOptions);
	};

export type Exec = ReturnType<typeof exec>;

export default exec;
