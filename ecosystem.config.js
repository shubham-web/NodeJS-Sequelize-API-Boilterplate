module.exports = {
	apps: [
		{
			name: "backend",
			script: "./bin/www",

			// Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
			interpreter_args: "--max_old_space_size=3072 --trace-warnings",
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "1G",
			env: {
				NODE_ENV: "development",
				UV_THREADPOOL_SIZE: 64,
			},
			env_production: {
				NODE_ENV: "production",
				UV_THREADPOOL_SIZE: 84,
			},
		},
		/* {
			name: "crons",
			script: "./cronjobs/index.js",

			// Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
			interpreter_args: "--max_old_space_size=3072 --trace-warnings",
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "1G",
			env: {
				NODE_ENV: "development",
			},
			env_production: {
				NODE_ENV: "production",
			},
		}, */
	],
};
