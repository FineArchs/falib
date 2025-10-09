import { describe, it, expect } from "vitest";
import { type } from "arktype";
import { sampleOf } from "./index.js";

describe("sampleOf", () => {
	const types = [
		type({
			name: "string",
			// email: /.+@.+\..+/,
			isAdmin: "boolean",
			tags: "string[]",
		}),
		type({
			"a?": "number",
			"b": {
				"c": "'foo'|'bar'|'baz'"
			},
			// "d": "Date"
		}),
	].map(t => [t.expression, t]);

	describe.for(types)('%s', ([_, target]) => {
		const samples = Array.from(
			{ length: 10 }, () => sampleOf(target as any)
		).map((t: any) => [t, t]);
		expect(samples).toHaveLength(10);

		it.for(samples)('%s', ([_, sample]) => {
			expect(() => (target as any).assert(sample)).not.toThrow();
		});
	});
});
