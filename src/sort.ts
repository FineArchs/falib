export type CompareFunction<T> = (a: T, b: T) => number;

export type InPlaceSortFunction = <T>(arr: T[], compare: CompareFunction<T>) => T[];
export type CopySortFunction = <T>(arr: readonly T[], compare: CompareFunction<T>) => T[];

export type InPlaceSortDef = {
	name: string;
	isInPlace: true;
	isStable: boolean;
	sort: InPlaceSortFunction;
	inPlaceSort: InPlaceSortFunction;
	copySort: CopySortFunction;
};
export type CopySortDef = {
	name: string;
	isInPlace: false;
	isStable: boolean;
	sort: CopySortFunction;
	inPlaceSort: InPlaceSortFunction;
	copySort: CopySortFunction;
};
export type SortDef = InPlaceSortDef | CopySortDef;

function inPlaceSortDef({ isStable, sort }: Pick<InPlaceSortDef, "isStable" | "sort">): InPlaceSortDef {
	return {
		name: sort.name!,
		isInPlace: true, isStable, sort,
		inPlaceSort: sort,
		copySort: (arr, compare) => sort(arr.slice(), compare),
	};
}

function copySortDef({ isStable, sort }: Pick<CopySortDef, "isStable" | "sort">): CopySortDef {
	return {
		name: sort.name!,
		isInPlace: false, isStable, sort,
		inPlaceSort(arr, compare) {
			const sorted = sort(arr, compare);
			arr.splice(0, arr.length, ...sorted);
			return arr;
		},
		copySort: sort,
	};
}

// stable in-place
export function esSort<T>(arr: T[], compare: CompareFunction<T>): T[] {
	return arr.sort(compare);
}
export const esSortDef = inPlaceSortDef({ isStable: true, sort: esSort });

// stable in-place
export function bubbleSort<T>(arr: T[], compare: CompareFunction<T>): T[] {
	let updated;
	do {
		updated = false;
		for (let i = 0; i < arr.length - 1; i++) {
			if (compare(arr[i]!, arr[i+1]!) > 0) {
				[arr[i], arr[i+1]] = [arr[i+1]!, arr[i]!];
				updated = true;
			}
		}
	} while (updated);
	return arr;
}
export const bubbleSortDef = inPlaceSortDef({ isStable: true, sort: bubbleSort });

// unstable in-place
export function selectionSort<T>(arr: T[], compare: CompareFunction<T>): T[] {
	const n = arr.length;
	for (let i = 0; i < n - 1; i++) {
		let minIndex = i;
		for (let j = i + 1; j < n; j++) {
			if (compare(arr[j]!, arr[minIndex]!) < 0) {
				minIndex = j;
			}
		}
		if (minIndex !== i) {
			[arr[i], arr[minIndex]] = [arr[minIndex]!, arr[i]!];
		}
	}
	return arr;
}
export const selectionSortDef = inPlaceSortDef({ isStable: false, sort: selectionSort });

// stable in-place
export function insertionSort<T>(arr: T[], compare: CompareFunction<T>): T[] {
	const n = arr.length;
	for (let i = 1; i < n; i++) {
		const current = arr[i]!;
		let j = i - 1;
		while (j >= 0 && compare(arr[j]!, current) > 0) {
			arr[j + 1] = arr[j]!;
			j--;
		}
		arr[j + 1] = current;
	}
	return arr;
}
export const insertionSortDef = inPlaceSortDef({ isStable: true, sort: insertionSort });

// unstable in-place
export function quickSort<T>(arr: T[], compare: CompareFunction<T>): T[] {
	function _quickSort(arr: T[], compare: CompareFunction<T>, left: number, right: number) {
		if (left >= right) return;

		const pivot = arr[Math.floor((left + right) / 2)]!;
		let i = left;
		let j = right;

		while (i <= j) {
			while (compare(arr[i]!, pivot) < 0) {
				i++;
			}
			while (compare(arr[j]!, pivot) > 0) {
				j--;
			}
			if (i <= j) {
				[arr[i], arr[j]] = [arr[j]!, arr[i]!];
				i++;
				j--;
			}
		}

		_quickSort(arr, compare, left, j);
		_quickSort(arr, compare, i, right);
	}
	_quickSort(arr, compare, 0, arr.length - 1);
	return arr;
}
export const quickSortDef = inPlaceSortDef({ isStable: false, sort: quickSort });

export const sortsRecord = { esSortDef, bubbleSortDef, selectionSortDef, insertionSortDef, quickSortDef } as const satisfies { [key in string]: { name: key } & SortDef };
export const sortsList = [esSortDef, bubbleSortDef, selectionSortDef, insertionSortDef, quickSortDef] as const satisfies SortDef[];
