"use strict";
/*
 * このコードではJavaScriptの反復処理プロトコル及びジェネレーター関数を利用しています。
 * 詳細は https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/function*
 * を参照して下さい。
 */
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DicNode = void 0;
// TODO: 同時書き込みが発生した場合の衝突の解決
var DicNode = /** @class */ (function () {
    function DicNode(kvs) {
        this.children = new Map();
        if (!kvs)
            return;
        for (var _i = 0, kvs_1 = kvs; _i < kvs_1.length; _i++) {
            var _a = kvs_1[_i], key = _a[0], val = _a[1];
            this.set(key, val);
        }
    }
    DicNode.prototype.get = function (key) {
        return this.getRaw(serialize(key));
    };
    DicNode.prototype.has = function (key) {
        return this.getRaw(serialize(key)) ? true : false;
    };
    DicNode.prototype.getRaw = function (keyGen) {
        var _a;
        var _b = keyGen.next(), key = _b.value, done = _b.done;
        if (done)
            return this.data;
        else
            return (_a = this.children.get(key)) === null || _a === void 0 ? void 0 : _a.getRaw(keyGen);
    };
    DicNode.prototype.set = function (key, val) {
        this.setRaw(serialize(key), val);
    };
    DicNode.prototype.setRaw = function (keyGen, val) {
        var _a = keyGen.next(), key = _a.value, done = _a.done;
        if (done)
            this.data = val;
        else {
            if (!this.children.has(key))
                this.children.set(key, new DicNode());
            this.children.get(key).setRaw(keyGen, val);
        }
    };
    DicNode.prototype.kvs = function () {
        var _i, _a, _b, seriExp, val;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, _a = this.serializedKvs();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], seriExp = _b[0], val = _b[1];
                    return [4 /*yield*/, [deserialize(seriExp), val]];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    DicNode.prototype.serializedKvs = function (keyPrefix) {
        var kp, _i, _a, _b, key, childNode;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    kp = keyPrefix !== null && keyPrefix !== void 0 ? keyPrefix : [];
                    if (!this.data) return [3 /*break*/, 2];
                    return [4 /*yield*/, [kp, this.data]];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2:
                    _i = 0, _a = this.children;
                    _c.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    _b = _a[_i], key = _b[0], childNode = _b[1];
                    return [5 /*yield**/, __values(childNode.serializedKvs(__spreadArray(__spreadArray([], kp, true), [key], false)))];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    };
    return DicNode;
}());
exports.DicNode = DicNode;
//# sourceMappingURL=dic.js.map