import { describe, test, expect } from 'vitest';
import * as L from '../src/sort.js';

const sorts = Object.entries({
	bubble: L.bubbleSort,
});
const testSets = Object.entries({
	numbers: {
		compare(a, b) { return a - b },
		generate() {
			let i = 0;
			while (Math.random() < 0.8) {
				if (Math.random() < 0.5) i += 1;
				i <<= 1;
			}
			if (Math.random() < 0.5) i *= -1;
			return i;
		}
	},
});

describe.for(testSets)('%s', ([, { compare, generate }]) => {
	const samples = Array.from(Array(10), () => {
		const len = Math.floor(11 * Math.random());
		const arr = Array.from(Array(len), generate);
		return [arr, L.esSort(Array.from(arr), compare)];
	});
	test.for(samples)('%j -> %j', ([sample, sorted]) => {
		const results = sorts.map(([,s]) => {
			const arr = sample.map(v => v);
			return s(arr, compare);
		});
		expect(results).toEqual(results.map(() => sorted));
	});
});
