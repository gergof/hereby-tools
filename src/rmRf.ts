import fs from 'node:fs/promises';

const rmRf = (taskName: string) => (dir: string) => {
	console.log(`[${taskName}] Deleting ${dir}`);

	return fs.rm(dir, {
		recursive: true,
		force: true
	});
};

export type RmRf = ReturnType<typeof rmRf>;

export default rmRf;
