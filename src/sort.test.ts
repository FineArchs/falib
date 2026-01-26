import { describe, test, expect } from 'vitest';
import * as L from '../src/sort.js';
import { objMap, repeatMap } from '../src/objutil.js';

type SampleSet<T> = {
	sample: T[];
	answer: T[];
};
const testSet = <T>({name, compare, generate }: {
	name: string,
	compare: (a: T, b: T) => number,
	generate: () => T,
}) => {
	const sampleSets: SampleSet<T>[] = repeatMap(10, () => {
		const len = Math.floor(11 * Math.random());
		const sample = repeatMap(len, generate);
		return { sample, answer: L.esSort(sample.map(v => v), compare) };
	});
	return { name, compare, sampleSets };
};
type TestSet<T> = ReturnType<typeof testSet<T>>;

const testSets = [
	testSet<number>({
		name: "numbers",
		compare(a, b) { return a - b },
		generate() {
			let i = 0;
			while (Math.random() < 0.8) {
				if (Math.random() < 0.5) i += 1;
				i <<= 1;
			}
			if (Math.random() < 0.5) i *= -1;
			return i;
		},
	}),
];

describe.for(Object.entries(L.sorts))('%s', ([, sort]) => {
	describe.each(testSets)('$name', tes => {
		test.each(tes.sampleSets)('$sample -> $answer', ({ sample, answer }) => {
			expect(sort(sample.map(v => v), tes.compare)).toEqual(answer);
		});
	});
});
