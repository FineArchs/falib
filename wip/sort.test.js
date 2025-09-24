"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var L = require("../src/sort.js");
var sorts = Object.entries({
    bubble: L.bubbleSort,
});
var testSets = Object.entries({
    numbers: {
        compare: function (a, b) { return a - b; },
        generate: function () {
            var i = 0;
            while (Math.random() < 0.8) {
                if (Math.random() < 0.5)
                    i += 1;
                i <<= 1;
            }
            if (Math.random() < 0.5)
                i *= -1;
            return i;
        }
    },
});
vitest_1.describe.for(testSets)('%s', function (_a) {
    var _b = _a[1], compare = _b.compare, generate = _b.generate;
    var samples = Array.from(Array(10), function () {
        var len = Math.floor(11 * Math.random());
        var arr = Array.from(Array(len), generate);
        return [arr, L.esSort(Array.from(arr), compare)];
    });
    vitest_1.test.for(samples)('%j -> %j', function (_a) {
        var sample = _a[0], sorted = _a[1];
        var results = sorts.map(function (_a) {
            var s = _a[1];
            var arr = sample.map(function (v) { return v; });
            return s(arr, compare);
        });
        (0, vitest_1.expect)(results).toEqual(results.map(function () { return sorted; }));
    });
});
//# sourceMappingURL=sort.test.js.map