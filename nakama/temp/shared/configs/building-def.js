"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingDef = void 0;
var BuildingDef = /** @class */ (function () {
    function BuildingDef(raw) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        this.id = raw.id;
        this.name = (_a = raw.name) !== null && _a !== void 0 ? _a : raw.id;
        this.category = (_b = raw.category) !== null && _b !== void 0 ? _b : "generic";
        this.size = { w: (_d = (_c = raw.size) === null || _c === void 0 ? void 0 : _c.w) !== null && _d !== void 0 ? _d : 1, h: (_f = (_e = raw.size) === null || _e === void 0 ? void 0 : _e.h) !== null && _f !== void 0 ? _f : 1 };
        this.maxCapacity = Object.freeze(__assign({}, ((_g = raw.maxCapacity) !== null && _g !== void 0 ? _g : {})));
        this.buildCost = Object.freeze(__assign({}, ((_h = raw.buildCost) !== null && _h !== void 0 ? _h : {})));
        this.buildTimeSeconds = (_j = raw.buildTimeSeconds) !== null && _j !== void 0 ? _j : 0;
        this.upgrades = Object.freeze(((_k = raw.upgrades) !== null && _k !== void 0 ? _k : []).map(function (u) { return (__assign({}, u)); }));
        this.placement = Object.freeze({
            canOverlap: (_m = (_l = raw.placement) === null || _l === void 0 ? void 0 : _l.canOverlap) !== null && _m !== void 0 ? _m : false,
            requiresFoundation: (_p = (_o = raw.placement) === null || _o === void 0 ? void 0 : _o.requiresFoundation) !== null && _p !== void 0 ? _p : false
        });
        this.production = raw.production ? Object.freeze(__assign({}, raw.production)) : undefined;
        this.tags = Object.freeze((_q = raw.tags) !== null && _q !== void 0 ? _q : []);
        this.raw = Object.freeze(__assign({}, raw));
        Object.freeze(this);
    }
    /** Lightweight validation — returns array of error messages (empty if ok) */
    BuildingDef.validateRaw = function (raw) {
        var err = [];
        if (!raw || typeof raw !== "object") {
            err.push("definition must be object");
            return err;
        }
        if (!raw.id || typeof raw.id !== "string")
            err.push("id is required and must be string");
        if (raw.size) {
            if (typeof raw.size.w !== "number" || typeof raw.size.h !== "number")
                err.push("size.w and size.h must be numbers");
        }
        if (raw.buildTimeSeconds !== undefined && typeof raw.buildTimeSeconds !== "number")
            err.push("buildTimeSeconds must be number");
        if (raw.upgrades && !Array.isArray(raw.upgrades))
            err.push("upgrades must be array");
        // add more rules as needed
        return err;
    };
    /** Factory: validate then create immutable BuildingDef */
    BuildingDef.fromJSON = function (raw) {
        var _a;
        var errs = BuildingDef.validateRaw(raw);
        if (errs.length)
            throw new Error("Invalid BuildingDef ".concat((_a = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _a !== void 0 ? _a : "", ": ").concat(errs.join("; ")));
        return new BuildingDef(raw);
    };
    BuildingDef.prototype.toJSON = function () {
        return __assign({}, this.raw);
    };
    return BuildingDef;
}());
exports.BuildingDef = BuildingDef;
