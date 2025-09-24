"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esSort = esSort;
exports.bubbleSort = bubbleSort;
// stable in-place
function esSort(arr, compare) {
    return arr.sort(compare);
}
// stable in-place
function bubbleSort(arr, compare) {
    var _a;
    var updated;
    do {
        updated = false;
        for (var i = 0; i < arr.length - 1; i++) {
            if (compare(arr[i], arr[i + 1]) > 0) {
                _a = [arr[i + 1], arr[i]], arr[i] = _a[0], arr[i + 1] = _a[1];
                updated = true;
            }
        }
    } while (updated);
    return arr;
}
//# sourceMappingURL=sort.js.map