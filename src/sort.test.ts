import { env } from 'node:process';
import { describe, test, expect } from 'vitest';
import rng from 'seed-random';
import * as L from '../src/sort.js';
import { objMap, repeatMap } from '../src/objutil.js';

const seedValue = env.TEST_SEED ?? `${Date.now()}`;
test(`TEST_SEED=${seedValue}`, () => expect(seedValue).toBeTypeOf('string'));
const random = rng(seedValue);

const testSet = <T>({ name, compare, generate }: {
	name: string,
	compare: (a: T, b: T) => number,
	generate: () => T[],
}) => repeatMap(10, (i) => {
	const sample = generate();
	return {
		name: `${name}#${i}`,
		compare, sample,
		answer: L.esSort(sample.slice(), compare),
	};
});
type TestSet<T> = ReturnType<typeof testSet<T>>;

const testSets = [
	...testSet<number>({
		name: "numbers",
		compare(a, b) { return a - b },
		generate() {
			const len = Math.floor(11 * random());
			return repeatMap(len, () => {
				let i = 0;
				while (random() < 0.8) {
					if (random() < 0.5) i += 1;
					i <<= 1;
				}
				if (random() < 0.5) i *= -1;
				return i;
			});
		},
	}),
];
const snapshot = (ts: typeof testSets) => JSON.stringify(testSets.map(
	({ name, sample, answer }) => ({ name, sample, answer })
));
const testSetsSnapshot = snapshot(testSets);;

describe.each(L.sortsList)('$name', ({ inPlaceSort, copySort }) => {
	test.each(testSets)('$name $sample -> $answer', tes => {
		{
			// in-place sort
			const copied = tes.sample.slice();
			const sorted = inPlaceSort(copied, tes.compare);
			expect.soft(copied).toEqual(tes.answer);
			expect.soft(sorted).toEqual(tes.answer);
			expect.soft(copied === sorted).toBe(true);
		} {
			// copy sort
			const copied = tes.sample.slice();
			const sorted = copySort(copied, tes.compare);
			expect.soft(copied).toEqual(tes.sample);
			expect.soft(sorted).toEqual(tes.answer);
			expect.soft(copied === sorted).toBe(false);
		}
	});
});

test('integrity check', () => expect(snapshot(testSets)).toEqual(testSetsSnapshot));
