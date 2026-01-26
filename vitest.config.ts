import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// not working
		coverage: {
			include: ['src'],
		},
		include: ['src/**/*.test.ts'],
		exclude: ['test/testutils.ts'],
		reporters: ['verbose'],
		chaiConfig: {
			truncateThreshold: 0,
		},
	},
});
