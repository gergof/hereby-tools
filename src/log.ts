const log = (taskName: string) => (msg: string) => {
	console.log(`[${taskName}] ${msg}`);
};

export type Log = ReturnType<typeof log>;

export default log;
