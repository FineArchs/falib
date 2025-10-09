import { Type } from "arktype";

// 汎用乱数ユーティリティ
const randInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const pickRand = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1) as any] as any;

const randString = (length = 8) =>
	Array.from({ length }, () => String.fromCharCode(randInt(97, 122))).join("");

// メイン関数
export function sampleOf<T>(t: Type<T>): T {
	const schema = t.toJsonSchema();
	return generateFromSchema(schema) as T;
}

function generateFromSchema(schema: any): unknown {
	if (!schema) {
		return undefined;
	}

	if (schema.const) {
		return schema.const;
	}

	if (schema.anyOf || schema.oneOf) {
		const subSchemas = schema.anyOf || schema.oneOf;
		return generateFromSchema(pickRand(subSchemas));
	}

	if (schema.enum) return pickRand(schema.enum);

	switch (schema.type) {
		case "string":
			return randString(schema.minLength ?? 3);
		case "number":
		case "integer":
			return randInt(schema.minimum ?? 0, schema.maximum ?? 100);
		case "boolean":
			return Math.random() < 0.5;
		case "null":
			return null;
		case "undefined":
			return undefined;
		case "object":
			const result: any = {};
			if (schema.properties) {
				for (const [key, propSchema] of Object.entries(schema.properties)) {
					if (Array.isArray(schema.required) && !schema.required.includes(key)) {
						if (Math.random() < 0.5) continue; // Optional property
					}
					result[key] = generateFromSchema(propSchema);
				}
			}
			return result;
		case "array":
			const len = randInt(schema.minItems ?? 1, schema.maxItems ?? 5);
			if (!schema.items) return [];
			return Array.from({ length: len }, () => generateFromSchema(schema.items));
		default:
			throw new Error(`sorry, type ${JSON.stringify(schema)} is not supported yet.`);
	}
}
