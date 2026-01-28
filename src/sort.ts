/**
 * TODO: メタ情報のexport
 */
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

export const sortsRecord = { esSortDef, bubbleSortDef, selectionSortDef } as const satisfies { [key in string]: { name: key } & SortDef };
export const sortsList = [esSortDef, bubbleSortDef, selectionSortDef] as const satisfies SortDef[];
