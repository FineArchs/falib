import { describe, it, expect } from 'vitest';
import { calcNode, calcArrow, undet } from './calcnode.js';
import { repeatMap } from './objutil.js';

describe('primary', () => {
	it('', () => {
		const [a, b, c] = repeatMap(3, () => calcNode<number>());
		calcArrow([a, b], [c], ([a, b]) => a + b);
		calcArrow([a, c], [b], ([a, c]) => c - a);
		calcArrow([b, c], [a], ([b, c]) => c - b);
		a.value = 1; b.value = 2;
		expect(c.value).toEqual(3);
	});
});
