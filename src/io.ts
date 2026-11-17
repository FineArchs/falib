import { readFileSync } from "node:fs";
import { createInterface, type Interface } from "node:readline/promises";

export class Repl {
	private readonly interface: Interface;

	public constructor() {
		this.interface = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	public read(prompt = ""): Promise<string> {
		return this.interface.question(prompt);
	}

	public print(...values: unknown[]): void {
		console.log(...values);
	}

	public exit(): void {
		this.interface.close();
	}
}

export type IOFunction<T> = (input: string) => T | PromiseLike<T>;

export async function io<T>(fn: IOFunction<T>): Promise<void> {
	try {
		const input = readFileSync(0, "utf8");
		const output = await fn(input);
		console.log(output);
	} catch (error) {
		console.error(error);
	}
}
