// stable in-place
export function esSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
	return arr.sort(compare);
}

// stable in-place
export function bubbleSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
	let updated;
	do {
		updated = false;
		for (let i = 0; i < arr.length - 1; i++) {
			if (compare(arr[i], arr[i+1]) > 0) {
				[arr[i], arr[i+1]] = [arr[i+1], arr[i]];
				updated = true;
			}
		}
	} while (updated);
	return arr;
}
