import { Repl } from "@FineArchs/falib/io.js";

const repl = new Repl();
while (true) {
	const input = await repl.read();
	if (input === "exit") {
		repl.exit();
		break;
	}
	repl.print(input.split("").reverse().join(""));
}
