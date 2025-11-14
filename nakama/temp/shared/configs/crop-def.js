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
exports.CropDef = void 0;
var CropDef = /** @class */ (function () {
    function CropDef(raw) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.id = raw.id;
        this.name = (_a = raw.name) !== null && _a !== void 0 ? _a : raw.id;
        this.seasons = Object.freeze((_b = raw.seasons) !== null && _b !== void 0 ? _b : []);
        this.growthStages = Math.max(1, Math.floor((_c = raw.growthStages) !== null && _c !== void 0 ? _c : ((_e = (_d = raw.growthTimesSeconds) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 1)));
        // normalize growthTimesSeconds: if provided use it, else split baseGrowthSeconds evenly
        if (Array.isArray(raw.growthTimesSeconds) && raw.growthTimesSeconds.length === this.growthStages) {
            this.growthTimesSeconds = Object.freeze(raw.growthTimesSeconds.map(function (n) { return Math.max(1, Math.floor(n)); }));
        }
        else if (typeof raw.baseGrowthSeconds === "number") {
            var per = Math.max(1, Math.floor(raw.baseGrowthSeconds / this.growthStages));
            this.growthTimesSeconds = Object.freeze(new Array(this.growthStages).fill(per));
        }
        else {
            this.growthTimesSeconds = Object.freeze(new Array(this.growthStages).fill(60)); // fallback 60s per stage
        }
        // waterRequiredPerStage
        if (Array.isArray(raw.waterRequiredPerStage) && raw.waterRequiredPerStage.length === this.growthStages) {
            this.waterRequiredPerStage = Object.freeze(raw.waterRequiredPerStage.map(function (n) { return Math.max(0, Number(n)); }));
        }
        else {
            this.waterRequiredPerStage = Object.freeze(new Array(this.growthStages).fill(1));
        }
        this.baseGrowthSeconds = raw.baseGrowthSeconds;
        // yield: allow single number or min/max
        if (typeof raw.yield === "number") {
            this.yield = Object.freeze({ min: raw.yield, max: raw.yield });
        }
        else {
            var y = (_f = raw.yield) !== null && _f !== void 0 ? _f : { min: 1, max: 1 };
            this.yield = Object.freeze({ min: Math.max(0, Math.floor((_g = y.min) !== null && _g !== void 0 ? _g : 1)), max: Math.max(0, Math.floor((_j = (_h = y.max) !== null && _h !== void 0 ? _h : y.min) !== null && _j !== void 0 ? _j : 1)) });
        }
        this.sellPrice = Number((_k = raw.sellPrice) !== null && _k !== void 0 ? _k : 0);
        this.seedCost = Number((_l = raw.seedCost) !== null && _l !== void 0 ? _l : 0);
        if (Array.isArray(raw.diseaseChancePerStage) && raw.diseaseChancePerStage.length === this.growthStages) {
            this.diseaseChancePerStage = Object.freeze(raw.diseaseChancePerStage.map(function (n) { return Math.max(0, Number(n)); }));
        }
        else {
            this.diseaseChancePerStage = Object.freeze(new Array(this.growthStages).fill(0));
        }
        this.harvestRequiresTool = Boolean((_m = raw.harvestRequiresTool) !== null && _m !== void 0 ? _m : false);
        this.special = raw.special ? Object.freeze(__assign({}, raw.special)) : undefined;
        this.tags = Object.freeze((_o = raw.tags) !== null && _o !== void 0 ? _o : []);
        this.raw = Object.freeze(__assign({}, raw));
        Object.freeze(this);
    }
    CropDef.validateRaw = function (raw) {
        var _a, _b;
        var err = [];
        if (!raw || typeof raw !== "object") {
            err.push("crop definition must be object");
            return err;
        }
        if (!raw.id || typeof raw.id !== "string")
            err.push("id is required and must be string");
        if (raw.growthStages !== undefined && (!Number.isInteger(raw.growthStages) || raw.growthStages < 1))
            err.push("growthStages must be integer >= 1");
        if (raw.growthTimesSeconds && !Array.isArray(raw.growthTimesSeconds))
            err.push("growthTimesSeconds must be array");
        if (raw.waterRequiredPerStage && !Array.isArray(raw.waterRequiredPerStage))
            err.push("waterRequiredPerStage must be array");
        if (raw.diseaseChancePerStage && !Array.isArray(raw.diseaseChancePerStage))
            err.push("diseaseChancePerStage must be array");
        // lengths check if arrays given with growthStages
        var stages = (_a = raw.growthStages) !== null && _a !== void 0 ? _a : (_b = raw.growthTimesSeconds) === null || _b === void 0 ? void 0 : _b.length;
        if (stages && raw.growthTimesSeconds && raw.growthTimesSeconds.length !== stages)
            err.push("growthTimesSeconds length must equal growthStages");
        if (stages && raw.waterRequiredPerStage && raw.waterRequiredPerStage.length !== stages)
            err.push("waterRequiredPerStage length must equal growthStages");
        if (stages && raw.diseaseChancePerStage && raw.diseaseChancePerStage.length !== stages)
            err.push("diseaseChancePerStage length must equal growthStages");
        return err;
    };
    CropDef.fromJSON = function (raw) {
        var _a;
        var errs = CropDef.validateRaw(raw);
        if (errs.length)
            throw new Error("Invalid CropDef ".concat((_a = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _a !== void 0 ? _a : "", ": ").concat(errs.join("; ")));
        return new CropDef(raw);
    };
    CropDef.prototype.toJSON = function () {
        return __assign({}, this.raw);
    };
    return CropDef;
}());
exports.CropDef = CropDef;
